import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const ManageRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    // Fetch registrations from the server
    fetch("/api/registrations")
      .then((response) => response.json())
      .then((data) => setRegistrations(data))
      .catch((error) => {
        console.error("Error fetching registrations:", error);
        toast.error("Failed to load registrations.");
      });
  }, []);

  const handleApprove = (id) => {
    // Approve registration logic
    fetch(`/api/registrations/${id}/approve`, { method: "POST" })
      .then((response) => {
        if (response.ok) {
          setRegistrations((prev) => prev.filter((reg) => reg.id !== id));
          toast.success("Registration approved.");
        } else {
          throw new Error("Failed to approve registration.");
        }
      })
      .catch((error) => {
        console.error("Error approving registration:", error);
        toast.error("Failed to approve registration.");
      });
  };

  const handleReject = (id) => {
    // Reject registration logic
    fetch(`/api/registrations/${id}/reject`, { method: "POST" })
      .then((response) => {
        if (response.ok) {
          setRegistrations((prev) => prev.filter((reg) => reg.id !== id));
          toast.success("Registration rejected.");
        } else {
          throw new Error("Failed to reject registration.");
        }
      })
      .catch((error) => {
        console.error("Error rejecting registration:", error);
        toast.error("Failed to reject registration.");
      });
  };

  return (
    <div>
      <h1>Manage Registrations</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {registrations.map((registration) => (
            <tr key={registration.id}>
              <td>{registration.name}</td>
              <td>{registration.email}</td>
              <td>
                <button onClick={() => handleApprove(registration.id)}>Approve</button>
                <button onClick={() => handleReject(registration.id)}>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageRegistrations;