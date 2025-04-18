import os
import glob
import logging

from click import prompt
from dotenv import load_dotenv
from langchain.chains.combine_documents.stuff import StuffDocumentsChain
from langchain.chains.llm import LLMChain
from langchain.chains.summarize.refine_prompts import prompt_template

# LangChain components
from langchain_community.document_loaders import (
    DirectoryLoader,
    TextLoader,
    PyPDFLoader,
    UnstructuredURLLoader, # Use UnstructuredURLLoader for URLs
)
from langchain.text_splitter import CharacterTextSplitter
from langchain.schema import Document
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_chroma import Chroma
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain
from langchain_core.prompts import ChatPromptTemplate, PromptTemplate
from langchain.chains import (
    create_history_aware_retriever,
    create_retrieval_chain,
)

# --- Configuration ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Load environment variables from .env file
load_dotenv(override=True)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    logging.error("FATAL ERROR: OPENAI_API_KEY not found in environment variables.")
    exit("OpenAI API Key is required. Please set the OPENAI_API_KEY environment variable.")
else:
    # Set it for LangChain components that might read it directly
    os.environ['OPENAI_API_KEY'] = OPENAI_API_KEY
    logging.info("OpenAI API Key loaded.")


MODEL = "gpt-4o-mini"
DB_NAME = "vector_db"
KNOWLEDGE_BASE_DIR = "Knowledge_base"
PAGE_URL = "https://om-shewale.onrender.com/"
TEXT_LOADER_KWARGS = {'encoding': 'utf-8'}
CHUNK_SIZE = 512
CHUNK_OVERLAP = 50


# --- Helper Function ---


def add_metadata(doc, doc_type):
    """Adds a 'doc_type' metadata field to a LangChain Document."""
    if not hasattr(doc, 'metadata') or doc.metadata is None:
        doc.metadata = {}
    doc.metadata["doc_type"] = doc_type
    return doc

# --- Core Logic Functions ---

def load_documents(folder_path, web_url):
    """Loads documents from a local folder and a web URL."""
    documents = []
    found_files = glob.glob(os.path.join(folder_path, "*"))
    logging.info(f"Found {len(found_files)} files/folders in {folder_path}.")

    if not found_files and not web_url:
       logging.warning("No files found in knowledge base folder and no web URL provided.")
       return documents # Return empty list

    # Load from folder
    for file_path in found_files:
        try:
            if file_path.endswith(".pdf"):
                logging.info(f"Loading PDF: {file_path}")
                loader = PyPDFLoader(file_path)
                # loader.load() returns a list of Document objects, one per page
                pages = loader.load()
                if pages:
                    # Combine all pages into one document for simplicity, or handle pages individually?
                    # Original code only used page 0 content. Let's try loading the first page as a Document.
                    doc = pages[0] # Directly use the Document object for the first page
                    doc = add_metadata(doc, "resume") # Add metadata to the existing Document
                    documents.append(doc)
                    logging.info(f"Successfully loaded page 1 from PDF: {os.path.basename(file_path)}")
                else:
                    logging.warning(f"Could not load any pages from PDF: {file_path}")

            elif file_path.endswith(".txt"): # Assuming other files are text
                logging.info(f"Loading text file: {file_path}")
                loader = TextLoader(file_path, **TEXT_LOADER_KWARGS)
                # loader.load() returns a list containing one Document object
                text_docs = loader.load()
                if text_docs:
                    doc = text_docs[0]
                    doc = add_metadata(doc, "text")
                    documents.append(doc)
                    logging.info(f"Successfully loaded text file: {os.path.basename(file_path)}")
                else:
                     logging.warning(f"Could not load text file: {file_path}")
            else:
                logging.warning(f"Skipping unsupported file type: {file_path}")
        except Exception as e:
            logging.error(f"Failed to load file {file_path}: {e}")

    # Load from Web URL
    if web_url:
        logging.info(f"Loading content from URL: {web_url}")
        try:
            # Using UnstructuredURLLoader is often better for web pages
            url_loader = UnstructuredURLLoader(urls=[web_url])
            web_docs = url_loader.load() # Synchronous load
            if web_docs:
                # web_docs is a list, usually with one Document for the whole page
                doc = web_docs[0]
                doc = add_metadata(doc, "webpage")
                documents.append(doc)
                logging.info(f"Successfully loaded content from {web_url}")
            else:
                logging.warning(f"Could not load any content from URL: {web_url}")
        except Exception as e:
            logging.error(f"Failed to load content from {web_url}: {e}")

    logging.info(f"Total documents loaded: {len(documents)}")
    if documents:
        logging.info(f"Document types found: {set(doc.metadata.get('doc_type', 'unknown') for doc in documents)}")
    return documents

def create_vector_store(docs, db_path):
    """Creates or overwrites a Chroma vector store from documents."""
    if not docs:
        logging.error("No documents provided to create vector store.")
        return None

    logging.info(f"Splitting {len(docs)} documents into chunks...")
    text_splitter = CharacterTextSplitter(chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP)
    chunks = text_splitter.split_documents(docs)
    logging.info(f"Total number of chunks created: {len(chunks)}")

    if not chunks:
        logging.error("Failed to create any chunks from the documents.")
        return None

    logging.info("Initializing embeddings model...")
    embeddings = OpenAIEmbeddings()

    # Delete existing collection if it exists (as per original notebook logic)
    if os.path.exists(db_path):
        logging.warning(f"Existing vector database found at '{db_path}'. Deleting collection...")
        Chroma(persist_directory=db_path, embedding_function=embeddings).delete_collection()
        logging.info("Existing collection deleted.")


    logging.info(f"Creating new vector store at '{db_path}'...")

    vector_db = Chroma.from_documents(
            documents=chunks,
            embedding=embeddings,
            persist_directory=db_path)
    logging.info("Vector store created successfully.")
        # Optional: Log collection details
    collection = vector_db._collection
    count = collection.count()
    logging.info(f"Vector store contains {count} embeddings.")
    return vector_db

def setup_conversation_chain():
    """Sets up the Conversational Retrieval Chain."""

    all_documents = load_documents(KNOWLEDGE_BASE_DIR, PAGE_URL)

    if not all_documents:
        logging.fatal("No documents were loaded. Exiting.")
        exit("Failed to load any documents. Check logs.")

    # 2. Create Vector Store
    vector_store = create_vector_store(all_documents, DB_NAME)
    if not vector_store:
        logging.error("Vector store is not available. Cannot set up conversation chain.")
        return None

    logging.info(f"Setting up LLM ({MODEL}) and conversation chain...")
    llm = ChatOpenAI(temperature=0.5, model=MODEL)
    memory = ConversationBufferMemory(memory_key='chat_history', return_messages=True, output_key='answer') # Ensure output_key is 'answer'
    retriever = vector_store.as_retriever()
    question_prompt = PromptTemplate.from_template(
        "Given the chat history and a new question, reformulate the question.\nChat History:\n{chat_history}\nQuestion: {question}")
    question_generator = LLMChain(llm=llm, prompt=question_prompt)

    # Document combining chain
    combine_prompt = PromptTemplate.from_template(
        "You are Jarvis, a virtual assistant designed to help users learn more about Om Shewale, a software developer specializing in AI/ML and computer vision. Your goal is to provide accurate, concise, and engaging responses to user queries about Om's background, skills, projects, hobbies, and other relevant topics. Use the following information to assist users effectively:\n{context}\nQuestion: {question}"
        "Be concise in your answers. Use the retreived documents to find relevant answer to the question\n")
    combine_docs_chain = StuffDocumentsChain(
        llm_chain=LLMChain(llm=llm, prompt=combine_prompt),
        document_variable_name="context"
    )

    conversation_chain = ConversationalRetrievalChain(
        question_generator=question_generator,
        combine_docs_chain=combine_docs_chain,
        retriever=retriever,
        memory=memory,
    )
    logging.info("Conversation chain set up successfully.")
    return conversation_chain

# --- Main Execution ---



def invoke_llm(chain, user_input):

    # 1. Load Documents
    print("Chain memory", chain.memory.buffer)

    try:

        result = chain.invoke({"question": user_input})


        logging.info(f"Question: {user_input}, Answer: {result['answer']}")
        # Optionally log source documents: logging.info(f"Sources: {result['source_documents']}")
        return result['answer']
    except Exception as e:
        logging.error(f"Error during chatbot query: {e}")
        return "Sorry, I encountered an error processing your request."


