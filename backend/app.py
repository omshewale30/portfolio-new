import os
import glob
import logging
from typing import Optional, Dict

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
    UnstructuredURLLoader,
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

from langchain_core.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate

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

# Singleton instances
_vector_store: Optional[Chroma] = None
_llm: Optional[ChatOpenAI] = None
_embeddings: Optional[OpenAIEmbeddings] = None

def get_embeddings() -> OpenAIEmbeddings:
    """Get or create the embeddings model."""
    global _embeddings
    if _embeddings is None:
        _embeddings = OpenAIEmbeddings()
    return _embeddings

def get_llm() -> ChatOpenAI:
    """Get or create the LLM model."""
    global _llm
    if _llm is None:
        _llm = ChatOpenAI(temperature=0.5, model=MODEL)
    return _llm

def load_documents(folder_path: str, web_url: str) -> list[Document]:
    """Loads documents from a local folder and a web URL."""
    documents = []
    
    # Load from folder
    for file_path in glob.glob(os.path.join(folder_path, "*")):
        try:
            if file_path.endswith(".pdf"):
                loader = PyPDFLoader(file_path)
                pages = loader.load()
                if pages:
                    doc = pages[0]
                    doc.metadata["doc_type"] = "resume"
                    documents.append(doc)
            elif file_path.endswith(".txt"):
                loader = TextLoader(file_path, **TEXT_LOADER_KWARGS)
                text_docs = loader.load()
                if text_docs:
                    doc = text_docs[0]
                    doc.metadata["doc_type"] = "text"
                    documents.append(doc)
        except Exception as e:
            logging.error(f"Failed to load file {file_path}: {e}")

    # Load from Web URL
    if web_url:
        try:
            url_loader = UnstructuredURLLoader(urls=[web_url])
            web_docs = url_loader.load()
            if web_docs:
                doc = web_docs[0]
                doc.metadata["doc_type"] = "webpage"
                documents.append(doc)
        except Exception as e:
            logging.error(f"Failed to load content from {web_url}: {e}")

    return documents

def get_vector_store() -> Chroma:
    """Get or create the vector store."""
    global _vector_store
    
    if _vector_store is None:
        # Load documents only if vector store doesn't exist
        documents = load_documents(KNOWLEDGE_BASE_DIR, PAGE_URL)
        if not documents:
            raise ValueError("No documents were loaded. Cannot create vector store.")

        # Split documents into chunks
        text_splitter = CharacterTextSplitter(chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP)
        chunks = text_splitter.split_documents(documents)

        # Create or load vector store
        if os.path.exists(DB_NAME):
            _vector_store = Chroma(persist_directory=DB_NAME, embedding_function=get_embeddings())
        else:
            _vector_store = Chroma.from_documents(
                documents=chunks,
                embedding=get_embeddings(),
                persist_directory=DB_NAME
            )
            _vector_store.persist()

    return _vector_store

def setup_conversation_chain():
    """Sets up the Conversational Retrieval Chain."""
    vector_store = get_vector_store()
    llm = get_llm()
    
    memory = ConversationBufferMemory(
        memory_key='chat_history',
        return_messages=True,
        output_key='answer'
    )
    
    retriever = vector_store.as_retriever()
    
    question_prompt = PromptTemplate.from_template(
        "Given the chat history and a new question, reformulate the question.\nChat History:\n{chat_history}\nQuestion: {question}"
    )
    question_generator = LLMChain(llm=llm, prompt=question_prompt)

    combine_prompt = ChatPromptTemplate.from_messages([
        SystemMessagePromptTemplate.from_template(
            "You are Jarvis, a virtual assistant designed to help users learn more about Om Shewale, a software developer specializing in AI/ML and computer vision. "
            "Your goal is to provide accurate, concise, and engaging responses to user queries about Om's background, skills, projects, hobbies, and other relevant topics."
        ),
        HumanMessagePromptTemplate.from_template(
            "Use the following information to assist users effectively:\n{context}\nQuestion: {question}\n"
            "Be concise in your answers. Use the retrieved documents to find a relevant answer."
        )
    ])

    combine_docs_chain = StuffDocumentsChain(
        llm_chain=LLMChain(llm=llm, prompt=combine_prompt),
        document_variable_name="context"
    )

    return ConversationalRetrievalChain(
        question_generator=question_generator,
        combine_docs_chain=combine_docs_chain,
        retriever=retriever,
        memory=memory,
    )

def invoke_llm(chain, user_input):
    """Invoke the LLM with the given input."""
    try:
        result = chain.invoke({"question": user_input})
        logging.info(f"Question: {user_input}, Answer: {result['answer']}")
        return result['answer']
    except Exception as e:
        logging.error(f"Error during chatbot query: {e}")
        return "Sorry, I encountered an error processing your request."


