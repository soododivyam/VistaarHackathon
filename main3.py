# -*- coding: utf-8 -*-
import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings, ChatHuggingFace, HuggingFaceEndpoint
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import PromptTemplate,MessagesPlaceholder
from audio import speaker
# ✅ 1. Setup your Hugging Face API key
os.environ["HUGGINGFACEHUB_API_TOKEN"] = ""  # put your own key

# ✅ 2. Load PDF
pdf_path = r""

if not os.path.exists(pdf_path):
    raise FileNotFoundError("PDF file not found at: " + pdf_path)

loader = PyPDFLoader(pdf_path)
pages = loader.load()
print(f"Loaded {len(pages)} pages from PDF.")

# ✅ 3. Split into chunks
import pickle

chunks_path = "chunks.pkl"

if os.path.exists(chunks_path):
    print(" Found existing chunks file, loading it...")
    with open(chunks_path, "rb") as f:
        chunks = pickle.load(f)
else:
    print(" Creating new chunks from PDF...")
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
    chunks = splitter.split_documents(pages)

    # Save chunks for next time
    with open(chunks_path, "wb") as f:
        pickle.dump(chunks, f)

    print(" Chunks created and saved.")
    
print("Total chunks:", len(chunks))


# ✅ 4. Create embeddings
model_name = "sentence-transformers/all-mpnet-base-v2"
hf = HuggingFaceEmbeddings(
    model_name=model_name,
    model_kwargs={"device": "cpu"},
    encode_kwargs={"normalize_embeddings": True},
)

#  5. Create and store FAISS index
index_path = "my_faiss_index"

if os.path.exists(index_path):
    print(" Found existing FAISS index, loading it...")
    vector_store = FAISS.load_local(index_path, hf, allow_dangerous_deserialization=True)
else:
    print(" Creating new FAISS index from documents...")
    vector_store = FAISS.from_documents(chunks, hf)
    vector_store.save_local(index_path)
    print(" FAISS index saved for future use.")


# ✅ 6. Reload FAISS (optional)
vector_store = FAISS.load_local("my_faiss_index", hf, allow_dangerous_deserialization=True)
retriever = vector_store.as_retriever(search_type="mmr", search_kwargs={"k": 3})

# ✅ 7. Setup LLM (use a public model)
llm = HuggingFaceEndpoint(
    repo_id="mistralai/Mistral-7B-Instruct-v0.3",
    max_new_tokens=30,
    task="text-generation",
)
#chat_history
chat_file = "chat_history.pkl"

# Load existing chat history or initialize empty
if os.path.exists(chat_file):
    with open(chat_file, "rb") as f:
        chat_history = pickle.load(f)
else:
    chat_history = []
chat_history_text = "\n".join([f"{m['role']}: {m['content']}" for m in chat_history])


# ✅ 8. Create prompt template
prompt = PromptTemplate(
    template="""
You are a helpful assistant.
Answer ONLY from the provided context,chat_history.
if question ask by user is not in context given. do not give answer say i dont now.
give answer in 20 words
Context:
{context}
Chat history:
{chat_history_text}
Question: {question}
""",
    input_variables=["context", "question","chat_history_text"],
)


# ✅ 10. Run the model
model = ChatHuggingFace(llm=llm)
model = ChatHuggingFace(llm=llm)
question = ""
###################################################################################################################################
while question.lower() != "exit":
    # Ask user input
    question = input("Enter your doubt: ")
    if question.lower() == "exit":
        break

    # Append user question to chat history
    chat_history.append({"role": "user", "content": question})

    # Retrieve relevant documents from FAISS
    retrieved_docs = retriever.invoke(question)
    context = "\n\n".join(doc.page_content for doc in retrieved_docs)

    # Update chat_history_text
    chat_history_text = "\n".join([f"{m['role']}: {m['content']}" for m in chat_history])

    # Create prompt
    final_prompt = prompt.invoke({
        "context": context,
        "question": question,
        "chat_history_text": chat_history_text
    })

    # Run model
    result = model.invoke(final_prompt)
    ai_response = result.content if hasattr(result, "content") else str(result)

    # Show response and append to chat history
    print("\n=== Answer ===\n")
    print(ai_response)
    speaker(ai_response=ai_response)
    chat_history.append({"role": "ai", "content": ai_response})
####################################################################################################################################
# Save chat history at the end
with open(chat_file, "wb") as f:
    pickle.dump(chat_history, f)