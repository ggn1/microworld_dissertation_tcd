from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware( # Allow Cross Origin Request from our frontend.
    CORSMiddleware, 
    allow_origins=['http://localhost:3000'],
    allow_credentials=True, 
    allow_methods=['*'], 
    allow_headers=['*']
)

# Common paths.
# GET = Get data (read only).
# POST = Create new data (write).
# PUT = Update data (write).
# DELETE = Delete data.

@app.get("/")
def root():
    return {"server": "running ..."}