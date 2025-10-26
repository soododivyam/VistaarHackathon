# server.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle, os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings, ChatHuggingFace, HuggingFaceEndpoint
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import PromptTemplate

# ===============================
# Load everything once on startup
# ===============================

app = Flask(__name__)
CORS(app)

# Your PDF file path

os.environ["HUGGINGFACEHUB_API_TOKEN"] = "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"

pdf_path = r"C:\Users\Shaurya Varshney\Desktop\pdf_reader\Notes.pdf"  # <<< put your PDF path here

if not os.path.exists(pdf_path):
    raise FileNotFoundError(f"PDF file not found at: {pdf_path}")

print("Loading PDF and building environment...")

loader = PyPDFLoader(pdf_path)
pages = loader.load()

# Load or create chunks
chunks_path = "chunks.pkl"
if os.path.exists(chunks_path):
    with open(chunks_path, "rb") as f:
        chunks = pickle.load(f)
else:
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
    chunks = splitter.split_documents(pages)
    with open(chunks_path, "wb") as f:
        pickle.dump(chunks, f)

# Embeddings and FAISS index
hf = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-mpnet-base-v2",
    model_kwargs={"device": "cpu"},
    encode_kwargs={"normalize_embeddings": True},
)

index_path = "my_faiss_index"
if os.path.exists(index_path):
    vector_store = FAISS.load_local(index_path, hf, allow_dangerous_deserialization=True)
else:
    vector_store = FAISS.from_documents(chunks, hf)
    vector_store.save_local(index_path)

retriever = vector_store.as_retriever(search_type="mmr", search_kwargs={"k": 3})

# Load LLM
llm = HuggingFaceEndpoint(
    repo_id="mistralai/Mistral-7B-Instruct-v0.3",
    max_new_tokens=30,
    task="text-generation",
)

model = ChatHuggingFace(llm=llm)

prompt_template = PromptTemplate(
    template="""
You are a helpful assistant.
Answer ONLY from the provided context and chat_history.
If the question is not answerable from context, say "I don't know."
Keep answers concise (max 20 words).
Context:
{context}
Chat history:
{chat_history_text}
Question: {question}
""",
    input_variables=["context", "question", "chat_history_text"],
)

# Load chat history
chat_file = "chat_history.pkl"
if os.path.exists(chat_file):
    with open(chat_file, "rb") as f:
        chat_history = pickle.load(f)
else:
    chat_history = []


# =====================================
# API endpoint for frontend connection
# =====================================
@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json()
    prompt = data.get("prompt")
    context_text = data.get("context")

    if not prompt:
        return jsonify({"response": "No prompt received."}), 400

    # Append user question
    chat_history.append({"role": "user", "content": prompt+str(context_text)})

    # Retrieve relevant docs
    retrieved_docs = retriever.invoke(prompt+str(context_text))
    retrieved_context = "\n\n".join(doc.page_content for doc in retrieved_docs)

    # Merge with frontend-sent context (optional)
    full_context = (context_text or "") + "\n\n" + retrieved_context

    # Combine chat history
    chat_history_text = "\n".join([f"{m['role']}: {m['content']}" for m in chat_history])

    # Create final prompt
    final_prompt = prompt_template.invoke({
        "context": full_context,
        "question": prompt,
        "chat_history_text": chat_history_text
    })

    # Run model
    result = model.invoke(final_prompt)
    ai_response = result.content if hasattr(result, "content") else str(result)

    # Save chat history
    chat_history.append({"role": "ai", "content": ai_response})
    with open(chat_file, "wb") as f:
        pickle.dump(chat_history, f)

    return jsonify({"response": ai_response})


if __name__ == "__main__":
    print("Starting Flask AI server on http://127.0.0.1:5000")
    app.run(port=5000, debug=True)
