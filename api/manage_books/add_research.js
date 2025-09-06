const API_URL = import.meta.env.VITE_API_URL;

export async function addResearch(research) {

  console.log('addResearch received payload:', research);
  const payload = {
    researchTitle: research.title,
    yearPublication: research.year,
    researchAbstract: research.abstract,
    department: research.department,
    shelfColumn: research.shelfColumn || research.shelf || 'A',
    shelfRow: research.shelfRow || '1',
    authors: Array.isArray(research.authors) ? research.authors : [research.authors]
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