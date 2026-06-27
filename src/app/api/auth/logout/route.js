function logout() {
  localStorage.removeItem('token'); // หรือ sessionStorage
  window.location.href = '/login';  // กลับไปหน้า login
}