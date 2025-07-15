
export const registerMusic = async (musicData, token) => {
  try {
    const response = await fetch('http://localhost:8000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(musicData)
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Erro ao registrar música:', error);
    return { success: false, message: 'Erro de conexão com o servidor REST' };
  }
};
