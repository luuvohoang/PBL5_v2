import React, { useState, useEffect } from 'react';
import { getEmployees, deleteEmployee, updateEmployee, createEmployee } from '../services/api';
import '../styles/EmployeeManagement.css';
import EmployeeForm from '../components/EmployeeForm';
import CreateEmployeeForm from '../components/CreateEmployeeForm';
import LoadingSpinner from '../components/LoadingSpinner';

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });

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

    const filteredEmployees = employees.filter(employee => {
        const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
        const matchesSearch = !searchTerm || 
            fullName.includes(searchTerm.toLowerCase()) ||
            employee.phoneNumber.includes(searchTerm);

        const matchesRole = !selectedRole || employee.role.name === selectedRole;

        const hireDate = new Date(employee.hireDate);
        const startDate = dateRange.startDate ? new Date(dateRange.startDate) : null;
        const endDate = dateRange.endDate ? new Date(dateRange.endDate) : null;

        const matchesDateRange = (!startDate || hireDate >= startDate) && 
                               (!endDate || hireDate <= endDate);

        return matchesSearch && matchesRole && matchesDateRange;
    });

    if (loading) return <LoadingSpinner />;

    return (
        <div className="employee-management">
            <div className="header">
                <h1>Employee Management</h1>
                {isAdmin && (
                    <button className="add-button" onClick={() => setShowCreateForm(true)}>
                        Add New Employee
                    </button>
                )}
            </div>

            <div className="search-filter">
                <div className="filter-controls">
                    <div className="search-input-container">
                        <input
                            type="text"
                            placeholder="Search by name or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <div className="filter-group">
                        <select 
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="role-select"
                        >
                            <option value="">All Roles</option>
                            <option value="Admin">Admin</option>
                            <option value="Staff">Staff</option>
                            <option value="Employee">Employee</option>
                        </select>

                        <div className="date-range">
                            <input
                                type="date"
                                value={dateRange.startDate}
                                onChange={(e) => setDateRange(prev => ({...prev, startDate: e.target.value}))}
                                className="date-input"
                            />
                            <span>to</span>
                            <input
                                type="date"
                                value={dateRange.endDate}
                                onChange={(e) => setDateRange(prev => ({...prev, endDate: e.target.value}))}
                                className="date-input"
                            />
                            {(dateRange.startDate || dateRange.endDate) && (
                                <button 
                                    className="clear-filter"
                                    onClick={() => setDateRange({startDate: '', endDate: ''})}
                                >
                                    Clear Dates
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="employee-list">
                <table>
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
                        {filteredEmployees.map(employee => (
                            <tr key={employee.id}>
                                <td>{`${employee.firstName} ${employee.lastName}`}</td>
                                <td>{employee.role.name}</td>
                                <td>{employee.phoneNumber}</td>
                                <td>{new Date(employee.hireDate).toLocaleDateString()}</td>
                                <td>${employee.salary.toFixed(2)}</td>
                                {isAdmin && (
                                    <td className="action-buttons">
                                        <button
                                            className="edit-button"
                                            onClick={() => handleEdit(employee)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="delete-button"
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
            </div>

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
