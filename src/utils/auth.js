import { jwtDecode } from "jwt-decode";

class AuthService {
  constructor() {
    this.TOKEN_KEY = "admin_token";
    this.USER_KEY = "admin_user";
  }

  // Check if admin is authenticated by validating token
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const decoded = jwtDecode(token);
      // Check if token is expired
      return decoded.exp > Date.now() / 1000;
    } catch (error) {
      console.error("Token validation error:", error);
      this.logout(); // Clear invalid token
      return false;
    }
  }

  // Get token from localStorage
  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Get admin user data from localStorage
  getUser() {
    const user = localStorage.getItem(this.USER_KEY);
    if (!user) return null;
    
    try {
      return JSON.parse(user);
    } catch (error) {
      console.error("Error parsing admin user data:", error);
      return null;
    }
  }

  // Save authentication data
  saveAuth(token, user) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    // Also set the simple isLoggedIn flag for backward compatibility
    localStorage.setItem("isLoggedIn", "true");
  }

  // Update admin user data while keeping the same token
  updateUser(user) {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  // Clear authentication data
  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem("isLoggedIn");
    
    // Additional cleanup if needed
    sessionStorage.clear();
  }

  // Logout helper utility for components
  logoutAndRedirect(navigate) {
    this.logout();
    
    // Hide navbar if it's expanded (for mobile)
    const navbar = document.querySelector(".navbar-collapse");
    if (navbar?.classList.contains("show")) {
      if (window.bootstrap?.Collapse) {
        const bsCollapse = new window.bootstrap.Collapse(navbar, {
          toggle: false,
        });
        bsCollapse.hide();
      }
    }

    // Redirect to login page
    if (navigate) {
      navigate("/login");
    } else {
      window.location.href = "/login";
    }
  }

  // Get admin user from token
  getUserFromToken() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded = jwtDecode(token);
      return decoded;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }

  // Mock login for admin (replace with actual API call)
  async login(username, password) {
    if (username === "admin" && password === "password") {
      // Create a proper JWT-like structure
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({
        sub: "admin",
        username: "admin",
        role: "admin",
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours from now
        iat: Math.floor(Date.now() / 1000)
      }));
      const signature = btoa("mock_signature");
      const mockToken = `${header}.${payload}.${signature}`;
      
      const mockUser = {
        id: 1,
        username: "admin",
        role: "admin",
        firstName: "Admin",
        lastName: "User"
      };

      this.saveAuth(mockToken, mockUser);
      return { token: mockToken, user: mockUser };
    } else {
      throw new Error("Invalid username or password");
    }
  }
}

// Create a singleton instance
const authService = new AuthService();
export default authService;