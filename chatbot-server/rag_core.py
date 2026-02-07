import os
import re
import json
import time
import math
import hashlib
import pathlib
import requests
from bs4 import BeautifulSoup
from pypdf import PdfReader
from rank_bm25 import BM25Okapi


def ensure_dir(p):
    pathlib.Path(p).mkdir(parents=True, exist_ok=True)

def safe_name(s):
    s = re.sub(r"\s+", " ", s).strip()
    s = re.sub(r"[^a-zA-Z0-9 _.,()]+", "", s)
    s = s[:120].strip()
    return s if s else "doc"

def write_text(path, text):
    with open(path, "w", encoding="utf8") as f:
        f.write(text)

def read_text(path):
    with open(path, "r", encoding="utf8") as f:
        return f.read()

def sha1(s):
    return hashlib.sha1(s.encode("utf8", errors="ignore")).hexdigest()

def http_get(url, timeout_s=40):
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    h = {
        "User-Agent": "Mozilla/5.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    }
    r = requests.get(url, headers=h, timeout=timeout_s, verify=False)
    r.raise_for_status()
    return r

def extract_text_from_html(html, base_url=None):
    soup = BeautifulSoup(html, "lxml")
    for tag in soup(["script", "style", "noscript"]):
        tag.decompose()
    title = ""
    if soup.title and soup.title.get_text():
        title = soup.title.get_text().strip()
    text = soup.get_text("\n")
    lines = [ln.strip() for ln in text.splitlines()]
    lines = [ln for ln in lines if ln]
    cleaned = "\n".join(lines)
    return title, cleaned

def extract_text_from_pdf_bytes(b):
    from io import BytesIO
    reader = PdfReader(BytesIO(b))
    parts = []
    for page in reader.pages:
        t = page.extract_text() or ""
        t = re.sub(r"\s+", " ", t).strip()
        if t:
            parts.append(t)
    return "\n".join(parts)

def url_join(a, b):
    if a.endswith("/"):
        a = a[:-1]
    if b.startswith("/"):
        b = b[1:]
    return a + "/" + b

def build_urls():
    h = chr(45)

    uscis = "https://www.uscis.gov"
    ina = url_join(uscis, "laws-and-policy/legislation/immigration-and-nationality-act")
    policy_export = url_join(uscis, "book/export/html/68600")

    fam = "https://fam.state.gov"
    fam_9 = url_join(fam, "Volumes/Details/09FAM")

    justice = "https://www.justice.gov"
    eoir_ag_bia = url_join(justice, "eoir/ag" + h + "bia" + h + "decisions")

    govinfo = "https://www.govinfo.gov"
    ecfr_t8 = url_join(govinfo, "bulkdata/ECFR/title" + h + "8/ECFR" + h + "title8.xml")

    return {
        "ina_page": ina,
        "uscis_policy_export_html": policy_export,
        "fam_9_toc": fam_9,
        "eoir_ag_bia_page": eoir_ag_bia,
        "govinfo_ecfr_title8_xml": ecfr_t8,
    }

def download_starter_corpus(out_dir):
    ensure_dir(out_dir)
    urls = build_urls()

    def save_html_as_text(url, label):
        r = http_get(url)
        title, text = extract_text_from_html(r.text, base_url=url)
        fn = safe_name(label + " " + (title or "")) + ".txt"
        path = os.path.join(out_dir, fn)
        write_text(path, "SOURCE: " + url + "\n\n" + text)
        return path

    saved = []
    saved.append(save_html_as_text(urls["ina_page"], "INA"))
    saved.append(save_html_as_text(urls["uscis_policy_export_html"], "USCIS Policy Manual Export"))
    saved.append(save_html_as_text(urls["fam_9_toc"], "FAM 9 Visas TOC"))
    saved.append(save_html_as_text(urls["eoir_ag_bia_page"], "EOIR AG and BIA Decisions Index"))

    r = http_get(urls["govinfo_ecfr_title8_xml"])
    xml_text = r.text
    fn = safe_name("eCFR Title 8 XML GovInfo") + ".xml"
    path = os.path.join(out_dir, fn)
    write_text(path, "SOURCE: " + urls["govinfo_ecfr_title8_xml"] + "\n\n" + xml_text)
    saved.append(path)

    return saved

def extract_text_from_file(path):
    p = path.lower()
    if p.endswith(".txt"):
        return read_text(path)
    if p.endswith(".pdf"):
        with open(path, "rb") as f:
            b = f.read()
        return extract_text_from_pdf_bytes(b)
    if p.endswith(".html") or p.endswith(".htm"):
        html = read_text(path)
        _, text = extract_text_from_html(html)
        return text
    if p.endswith(".xml"):
        return read_text(path)
    if p.endswith(".jpg") or p.endswith(".jpeg") or p.endswith(".png"):
        try:
            from PIL import Image
            import pytesseract
            
            if not os.path.isfile(r"C:\Program Files\Tesseract-OCR\tesseract.exe"):
                pass
            else:
                pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
            
            return pytesseract.image_to_string(Image.open(path))
        except Exception as e:
            print(f"⚠️ Error reading image {path}: {e}")
            print("To read images, install Tesseract OCR: https://github.com/UB-Mannheim/tesseract/wiki")
            return ""
    return ""

def chunk_text(text, chunk_chars=1600, overlap_chars=240):
    text = re.sub(r"\r\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    if not text:
        return []
    chunks = []
    i = 0
    n = len(text)
    while i < n:
        j = min(i + chunk_chars, n)
        chunk = text[i:j].strip()
        if chunk:
            chunks.append(chunk)
        if j >= n:
            break
        i = max(0, j - overlap_chars)
    return chunks

def tokenize(s):
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", " ", s)
    parts = [p for p in s.split() if p]
    return parts

def build_index(corpus_dir, index_dir):
    ensure_dir(index_dir)
    items = []
    for root, _, files in os.walk(corpus_dir):
        for name in files:
            path = os.path.join(root, name)
            text = extract_text_from_file(path)
            if not text:
                continue
            base = os.path.relpath(path, corpus_dir)
            chunks = chunk_text(text)
            for k, ch in enumerate(chunks):
                items.append({
                    "id": sha1(base + "::" + str(k)),
                    "source": base,
                    "chunk_index": k,
                    "text": ch,
                })

    texts = [it["text"] for it in items]
    tokens = [tokenize(t) for t in texts]
    bm25 = BM25Okapi(tokens)

    with open(os.path.join(index_dir, "items.jsonl"), "w", encoding="utf8") as f:
        for it in items:
            f.write(json.dumps(it, ensure_ascii=False) + "\n")

    meta = {
        "count": len(items),
        "built_at_unix": int(time.time()),
    }
    write_text(os.path.join(index_dir, "meta.json"), json.dumps(meta, indent=2))

    import pickle
    with open(os.path.join(index_dir, "bm25.pkl"), "wb") as f:
        pickle.dump(bm25, f)

    return meta

def load_index(index_dir):
    import pickle
    items = []
    with open(os.path.join(index_dir, "items.jsonl"), "r", encoding="utf8") as f:
        for line in f:
            items.append(json.loads(line))
    with open(os.path.join(index_dir, "bm25.pkl"), "rb") as f:
        bm25 = pickle.load(f)
    return items, bm25

def retrieve(items, bm25, query, k=6):
    qtok = tokenize(query)
    scores = bm25.get_scores(qtok)
    ranked = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:k]
    out = []
    for i in ranked:
        it = items[i]
        out.append({
            "source": it["source"],
            "chunk_index": it["chunk_index"],
            "text": it["text"],
            "score": float(scores[i]),
        })
    return out

def format_context(hits, max_chars=8000):
    parts = []
    total = 0
    for h in hits:
        header = "SOURCE FILE: " + h["source"] + "  CHUNK: " + str(h["chunk_index"])
        body = h["text"].strip()
        block = header + "\n" + body
        if total + len(block) > max_chars:
            break
        parts.append(block)
        total += len(block)
    return "\n\n".join(parts)

def generate_answer(api_key, index_dir, query, history=[]):
    from groq import Groq
    
    items, bm25 = load_index(index_dir)
    client = Groq(api_key=api_key)
    model = "llama-3.3-70b-versatile"
    
    system = "You are an expert immigration law assistant using the Quantro dashboard. Answer using ONLY the provided context. If the context is missing info, say so. Cite the specific source document (e.g., 'According to INA 212...'). Keep answers concise."

    hits = retrieve(items, bm25, query, k=5)
    ctx = format_context(hits)

    messages = [{"role": "system", "content": system}]
    for h in history:
        messages.append({"role": h["role"], "content": h["content"]})
    
    prompt = f"CONTEXT:\n{ctx}\n\nQUESTION:\n{query}"
    messages.append({"role": "user", "content": prompt})
    
    try:
        completion = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.3,
            max_tokens=1024,
        )
        answer = completion.choices[0].message.content.strip()
        return answer, hits
    except Exception as e:
        return f"Error creating response: {e}", []

def initialize_corpus():
    corpus_dir = os.path.join(os.getcwd(), "corpus")
    index_dir = os.path.join(os.getcwd(), "index")
    ensure_dir(corpus_dir)
    ensure_dir(index_dir)

    corpus_files = [f for f in os.listdir(corpus_dir) if os.path.isfile(os.path.join(corpus_dir, f))]
    if not corpus_files:
        print("📥 Downloading immigration law corpus (one-time)...")
        saved = download_starter_corpus(corpus_dir)
        print(f"   Downloaded {len(saved)} files\n")

    index_file = os.path.join(index_dir, "bm25.pkl")
    needs_rebuild = not os.path.exists(index_file)
    
    if not needs_rebuild:
        corpus_mtime = max(os.path.getmtime(os.path.join(corpus_dir, f)) for f in os.listdir(corpus_dir))
        index_mtime = os.path.getmtime(index_file)
        if corpus_mtime > index_mtime:
            needs_rebuild = True
            print("📝 Corpus changed, rebuilding index...")
    
    if needs_rebuild:
        print("🔨 Building search index...")
        meta = build_index(corpus_dir, index_dir)
        print(f"   Indexed {meta['count']} chunks\n")
    
    return index_dir

if __name__ == "__main__":
    key = os.environ.get("GROQ_API_KEY") or "TEST_KEY"
    idx = initialize_corpus()
    print("Corpus initialized. Ready for server.")
