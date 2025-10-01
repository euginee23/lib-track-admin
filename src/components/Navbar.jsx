import { Link } from "react-router-dom";
import { FaTachometerAlt, FaBook, FaUserPlus, FaExchangeAlt, FaExclamationTriangle, FaClipboardList, FaCog } from "react-icons/fa";

function Navbar({ onLogout }) {
	return (
		<nav className="navbar navbar-expand-lg py-2 wmsu-bg-primary text-white">
			<div className="container">
				<Link
					className="navbar-brand fw-semibold fs-6 text-white d-flex align-items-center"
					to="/"
				>
					<img
						src="/wmsu_logo.png"
						alt="WMSU Logo"
						height="30"
						className="me-2"
					/>
					WMSU Lib-Track
				</Link>
				<div className="ms-auto d-flex align-items-center gap-2">
					{/* Desktop logout button */}
					<button 
						className="btn btn-danger btn-sm fw-semibold px-3 d-none d-lg-block" 
						type="button"
						onClick={onLogout}
					>
						Logout
					</button>
					
					{/* Mobile menu */}
					<div className="d-lg-none">
						<div className="dropdown">
							<button
								className="btn btn-light btn-sm dropdown-toggle fw-semibold px-3"
								type="button"
								id="navbarPopoverMenu"
								data-bs-toggle="dropdown"
								aria-expanded="false"
							>
								Menu
							</button>
							<ul className="dropdown-menu dropdown-menu-end shadow p-0 overflow-hidden" aria-labelledby="navbarPopoverMenu" style={{ minWidth: 220 }}>
								<li className="bg-light px-3 py-2 border-bottom">
									<span className="fw-bold text-secondary small">Navigation</span>
								</li>
								<li>
									<Link className="dropdown-item d-flex align-items-center gap-2 py-2" to="/dashboard">
										<FaTachometerAlt /> Dashboard
									</Link>
								</li>
								<li>
									<Link className="dropdown-item d-flex align-items-center gap-2 py-2" to="/manage-books">
										<FaBook /> Manage Books
									</Link>
								</li>
								<li>
									<Link className="dropdown-item d-flex align-items-center gap-2 py-2" to="/manage-registrations">
										<FaUserPlus /> Manage Registrations
									</Link>
								</li>
								<li>
									<Link className="dropdown-item d-flex align-items-center gap-2 py-2" to="/book-transactions">
										<FaExchangeAlt /> Book Transactions
									</Link>
								</li>
								<li>
									<Link className="dropdown-item d-flex align-items-center gap-2 py-2" to="/manage-penalties">
										<FaExclamationTriangle /> Manage Penalties
									</Link>
								</li>
								<li>
									<Link className="dropdown-item d-flex align-items-center gap-2 py-2" to="/activity-logs">
										<FaClipboardList /> Activity Logs
									</Link>
								</li>
								<li><hr className="dropdown-divider my-1" /></li>
								<li>
									<Link className="dropdown-item d-flex align-items-center gap-2 py-2" to="/settings">
										<FaCog /> Settings
									</Link>
								</li>
								<li><hr className="dropdown-divider my-1" /></li>
								<li>
									<button 
										className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger" 
										type="button"
										onClick={onLogout}
									>
										Logout
									</button>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</nav>
	);
}

export default Navbar;
