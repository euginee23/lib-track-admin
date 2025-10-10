const API_URL = import.meta.env.VITE_API_URL;

export async function addResearch(research) {
  const payload = {
    researchTitle: research.title,
    yearPublication: research.year,
    researchAbstract: research.abstract,
    departmentId: research.department,
    shelfLocationId: research.shelfLocationId,
    authors: Array.isArray(research.authors) ? research.authors : [research.authors],
    price: research.price || "0"
  };

  const response = await fetch(`${API_URL}/api/research-papers/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error:', errorText);
    throw new Error(`Failed to add research paper: ${response.status} ${response.statusText}`);
  }
  return response.json();
}