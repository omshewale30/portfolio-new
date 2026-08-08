/**
 * Simple test for the response parser
 * Run this in the browser console to test the parser
 */

import { parseResponseWithSources } from './responseParser.js';

// Test cases
const testCases = [
    {
        name: "Response with multiple sources",
        input: "Om has quite the impressive educational background! He is currently pursuing a Master of Science in Computer Science at the University of North Carolina at Chapel Hill, specializing in Artificial Intelligence and Computer Vision, and he's maintaining a stellar 4.0 GPA【4:1†source】. Before that, he graduated Summa Cum Laude from Arizona State University with a Bachelor's degree in Computer Science, also achieving a perfect 4.0 GPA【4:0†source】【4:1†source】.",
        expected: {
            hasSources: true,
            sourceCount: 2,
            textContains: "[1]",
            textContains: "[2]"
        }
    },
    {
        name: "Response without sources",
        input: "Hello! How can I help you today?",
        expected: {
            hasSources: false,
            sourceCount: 0
        }
    },
    {
        name: "Empty response",
        input: "",
        expected: {
            hasSources: false,
            sourceCount: 0
        }
    }
];

export const runParserTests = () => {
    console.log("🧪 Running Response Parser Tests...");
    
    testCases.forEach((testCase, index) => {
        console.log(`\nTest ${index + 1}: ${testCase.name}`);
        
        try {
            const result = parseResponseWithSources(testCase.input);
            
            // Check if sources were found
            const hasSources = result.sources.length > 0;
            const sourceCount = result.sources.length;
            
            console.log(`Input: "${testCase.input.substring(0, 50)}..."`);
            console.log(`Parsed text: "${result.text.substring(0, 50)}..."`);
            console.log(`Sources found: ${sourceCount}`);
            console.log(`Sources:`, result.sources);
            
            // Validate results
            let passed = true;
            
            if (testCase.expected.hasSources !== hasSources) {
                console.error(`❌ Expected hasSources: ${testCase.expected.hasSources}, got: ${hasSources}`);
                passed = false;
            }
            
            if (testCase.expected.sourceCount !== sourceCount) {
                console.error(`❌ Expected sourceCount: ${testCase.expected.sourceCount}, got: ${sourceCount}`);
                passed = false;
            }
            
            if (testCase.expected.textContains) {
                if (!result.text.includes(testCase.expected.textContains)) {
                    console.error(`❌ Expected text to contain "${testCase.expected.textContains}"`);
                    passed = false;
                }
            }
            
            if (passed) {
                console.log("✅ Test passed!");
            } else {
                console.log("❌ Test failed!");
            }
            
        } catch (error) {
            console.error(`❌ Test failed with error:`, error);
        }
    });
    
    console.log("\n🎉 All tests completed!");
};

// Example usage in browser console:
// import('./utils/responseParser.test.js').then(module => module.runParserTests()); 