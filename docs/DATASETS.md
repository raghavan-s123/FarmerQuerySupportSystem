# Datasets Used in KrishiMitra

This project uses real, publicly available Kaggle datasets, matching the
Dataset section of the reference paper: *"This system uses publicly
available agricultural datasets ... The RAG pipeline indexes these
datasets."*

Both datasets below are wired into `rag/build_index.py` by default.

---

## 1. Farmers' Call Query Dataset (primary RAG knowledge base)

**Link:** https://www.kaggle.com/datasets/daskoushik/farmers-call-query-data-qa

Real questions asked by Indian farmers to the Kisan Call Center helpline,
with expert-given answers - this is the main source of farming Q&A knowledge
for the RAG pipeline.

**Setup:**
1. Download the CSV from Kaggle.
2. Rename its question/answer columns to exactly `question` and `answer`
   (add a `category` column if you like).
3. Save it as `ai-service/data/kcc_dataset.csv`.
4. Run `python rag/build_index.py` - it's already listed in `CSV_FILES`.

---

## 2. Crop Recommendation Dataset (soil & climate knowledge)

**Link:** https://www.kaggle.com/datasets/atharvaingle/crop-recommendation-dataset

Contains N, P, K (soil nutrients), temperature, humidity, pH and rainfall
values mapped to the best-suited crop.

**Setup:**
1. Download the CSV from Kaggle.
2. Save it as `ai-service/data/crop_recommendation_raw.csv`.
3. Run:
   ```bash
   python rag/prepare_crop_dataset.py
   ```
   This converts the raw numeric rows into readable Q&A entries like
   *"What are the ideal soil and climate conditions for growing Rice?"*
   and saves them to `ai-service/data/crop_recommendation_qa.csv`.
4. Run `python rag/build_index.py` - it's already listed in `CSV_FILES`.

---

## 3. Plant Disease Detection Dataset (CNN training)

**Link:** https://www.kaggle.com/datasets/emmarex/plantdisease

The PlantVillage dataset - ~20,000+ labelled leaf images used to train the
MobileNetV2-based CNN (transfer learning) for the Crop Disease Detection
module.

**Setup:**
1. Download and unzip.
2. Copy the class folders into `ai-service/disease/dataset/`.
3. Run `python disease/train_model.py`.
4. Restart `main.py` - the trained model loads automatically.

Until trained, disease detection runs in a safe DEMO mode with realistic
sample predictions, so the rest of the app stays fully demoable.

---

## A small bootstrap dataset is included by default

`ai-service/data/knowledge_base.csv` (30 hand-written farming Q&A pairs) is
already included so `/ask` works immediately, even before you download the
two Kaggle datasets above. Add the real datasets any time to make the RAG
pipeline far more comprehensive - exactly as described in the paper.
