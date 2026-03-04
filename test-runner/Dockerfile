FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Chromium and ALL its system dependencies in one shot
RUN playwright install --with-deps chromium

COPY . .

EXPOSE 8085

CMD ["python", "app.py"]
