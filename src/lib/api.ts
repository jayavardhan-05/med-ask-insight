const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export interface ChatRequest {
  question: string;
}

export interface ChatResponse {
  answer: string;
  sources: Array<{
    content: string;
    metadata?: Record<string, any>;
  }>;
}

export class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async health(): Promise<{ status: string }> {
    const response = await fetch(`${this.baseUrl}/api/health`);
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async uploadDocument(file: File): Promise<{ success: boolean; message: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/api/documents/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Document upload failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getDocuments(): Promise<Array<{ id: string; name: string; uploadDate: string }>> {
    const response = await fetch(`${this.baseUrl}/api/documents`);

    if (!response.ok) {
      throw new Error(`Failed to fetch documents: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async deleteDocument(documentId: string): Promise<{ success: boolean }> {
    const response = await fetch(`${this.baseUrl}/api/documents/${documentId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete document: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}

export const apiService = new ApiService();