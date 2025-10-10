# 🧬 Gene Expression Visualization App

**Tasks Implemented**
1. Protein Sequence Retrieval  
2. Heatmap Visualization (Plotly)  
3. Downloadable TSV File  


## Quick Setup


### 1. Clone the repository
Open a terminal and navigate to your desired folder:
```bash
cd <your-folder>
git clone https://github.com/muditarya7/gene_task.git
cd gene_task
```
### 2. Initiate Container

-Once the project is cloned , open the root folder and run following commands to start the docker containers:
'docker compose up --build'

### 3. Accessing the App
-Once the image is read you can redirect to these links:

Frontend- http://localhost:5173/
Backend - http://localhost:8000/

### ### 4. Initialize the Database
-Once the containers are running, open a new terminal and apply the database migrations:
`docker compose exec api python manage.py migrate`


For the loading the data in tables, I have made a script which directly puts both the file in Postgres Database.

Both files reside in the path-`/Users/aryam/Desktop/test/backend/api/data`
The script resides in the path- `/Users/aryam/Desktop/test/backend/api/management/commands/load_data.py`

Copy the 3 line command and Run it for importing the data to database:

```bash 
    docker compose exec api python manage.py load_data \
  --fasta ./api/data/STRG0A60OAF.protein.sequences.v12.0.fa \
  --tsv ./api/data/all_samples.tsv 
  ```

### 5. What Happens Next?

   Backend (api) exposes REST endpoints to:
        -Fetch protein FASTA sequences
        -Generate gene expression heatmaps
        -Download expression data in TSV format
   Frontend (web) lets you:
        -Enter gene names (up to 10 at once)
        -View heatmaps interactively
        -Download expression tables
   Database (db) has now both FASTA sequences and Expression values. 


### 6. To STOP and Want to Rebuild?

To safely stop all running containers (API, frontend, and database):
`docker compose down`

Now, from here if you want to rebuild again just use:
`docker compose up --build`

If you want to delete old data and containers (like resetting the app):
`docker compose down -v`


⚠️ NOTE on Missing Genes During Data Load
When running the data-loading command, you might see messages like:

```bash
Gene not found: VaccDscaff1-augustus-gene-274.25
Gene not found: __no_feature
Gene not found: __alignment_not_unique
```
-These warnings simply indicate that some gene identifiers listed 
in the TSV expression file are not present in the FASTA sequence file.
-The script is designed to skip unmatched genes rather than fail, ensuring 
only valid gene-expression pairs are inserted into the database.
-This is normal and does not affect functionality — all valid genes are 
successfully loaded and available for retrieval, visualization, and download.







👤 Author
Mudit Arya
Full-Stack Developer (Django + React + Docker)
GitHub →https://github.com/muditarya7




