async function testAPIs() {
  try {
    const res = await fetch('http://localhost:3000/api/internships');
    if (!res.ok) {
       console.log('Internships API failed:', res.status, res.statusText);
       return;
    }
    const data = await res.json();
    console.log('Internships active count:', data?.data?.length);
    console.log('First internship:', data?.data?.[0]);
  } catch (e) {
    console.log('Error hitting server:', e.message);
  }
}

testAPIs();
