import React, { useState, useEffect } from 'react';
import { getEmployees, deleteEmployee, updateEmployee, createEmployee } from '../services/api';
import '../styles/Employees.css';
import EmployeeForm from '../components/EmployeeForm';
import CreateEmployeeForm from '../components/CreateEmployeeForm';

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);

    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user?.role === 'Admin';

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const data = await getEmployees();
            setEmployees(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching employees:', error);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
            try {
                await deleteEmployee(id);
                setEmployees(employees.filter(emp => emp.id !== id));
            } catch (error) {
                console.error('Error deleting employee:', error);
            }
        }
    };

    const handleEdit = (employee) => {
        setSelectedEmployee(employee);
        setShowForm(true);
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (selectedEmployee) {
                const updatedEmployee = await updateEmployee(selectedEmployee.id, {
                    ...selectedEmployee,
                    ...formData
                });
                setEmployees(employees.map(emp =>
                    emp.id === selectedEmployee.id ? updatedEmployee : emp
                ));
                setShowForm(false);
                setSelectedEmployee(null);
            }
        } catch (error) {
            console.error('Error updating employee:', error);
            alert('Failed to update employee. Please try again.');
        }
    };

    const handleCreateEmployee = async (formData) => {
        try {
            const newEmployee = await createEmployee(formData);
            setEmployees([...employees, newEmployee]);
            setShowCreateForm(false);
        } catch (error) {
            console.error('Error creating employee:', error);
            alert('Failed to create employee. Please try again.');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="employee-container">
            <div className="employee-header">
                <h1>Employees Management</h1>
                {isAdmin && (
                    <button
                        className="btn-edit"
                        onClick={() => setShowCreateForm(true)}
                    >
                        Add New Employee
                    </button>
                )}
            </div>
            <table className="employee-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Phone</th>
                        <th>Hire Date</th>
                        <th>Salary</th>
                        {isAdmin && <th>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {employees.map(employee => (
                        <tr key={employee.id}>
                            <td>{`${employee.firstName} ${employee.lastName}`}</td>
                            <td>{employee.role.name}</td>
                            <td>{employee.phoneNumber}</td>
                            <td>{new Date(employee.hireDate).toLocaleDateString()}</td>
                            <td>${employee.salary.toFixed(2)}</td>
                            {isAdmin && (
                                <td className="employee-actions">
                                    <button
                                        className="btn-edit"
                                        onClick={() => handleEdit(employee)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn-delete"
                                        onClick={() => handleDelete(employee.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>

            {showCreateForm && (
                <CreateEmployeeForm
                    onSubmit={handleCreateEmployee}
                    onClose={() => setShowCreateForm(false)}
                />
            )}

            {showForm && (
                <EmployeeForm
                    employee={selectedEmployee}
                    onSubmit={handleFormSubmit}
                    onClose={() => {
                        setShowForm(false);
                        setSelectedEmployee(null);
                    }}
                />
            )}
        </div>
    );
};

export default Employees;
