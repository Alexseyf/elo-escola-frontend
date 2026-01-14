import { api } from "@/lib/api";

interface RecoveryResponse {
  success: boolean;
  message?: string;
  code?: string;
}

export async function recuperaSenha(email: string): Promise<RecoveryResponse> {
  try {
    const endpoint = "/api/v1/recupera-senha";
    console.log(`[recuperaSenha] Enviando POST para ${endpoint} | Email: ${email}`);
    
    const response = await api(endpoint, {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    console.log(`[recuperaSenha] Status: ${response.status}`);

    if (response.ok) {
      return { success: true };
    }
    
    try {
      const data = await response.json();
      return { success: false, message: data.erro || "Erro na solicitação", code: data.codigo };
    } catch {
       const text = await response.text();
       return { success: false, message: text || "Erro ao conectar com o servidor" };
    }

  } catch (error) {
    console.error("Erro ao recuperar senha:", error);
    return { success: false, message: "Erro inesperado. Tente novamente." };
  }
}

export async function validaSenha(email: string, code: string, novaSenha: string): Promise<RecoveryResponse> {
  try {
    const endpoint = "/api/v1/valida-senha";
    console.log(`[validaSenha] Enviando POST para ${endpoint}`);
    
    const response = await api(endpoint, {
      method: "POST",
      body: JSON.stringify({ email, code, novaSenha }),
    });

    console.log(`[validaSenha] Status: ${response.status}`);

    if (response.ok) {
        return { success: true };
    }

    try {
        const data = await response.json();
        const msg = data.erro || "Erro na validação";
        return { success: false, message: msg, code: data.codigo };
    } catch {
        const text = await response.text();
        return { success: false, message: text || "Erro ao validar senha" };
    }

  } catch (error) {
    console.error("Erro ao validar senha:", error);
    return { success: false, message: "Erro inesperado. Tente novamente." };
  }
}
