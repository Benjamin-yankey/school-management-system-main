import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import { ArrowLeft, DollarSign, Clock, CheckCircle, AlertCircle, Calendar, CreditCard, Download, ShieldCheck } from "lucide-react";
import "./StudentFeatures.css";

const StudentPayments = () => {
    const { user } = useAuth();

    const outstandingBalance = 450.0;
    const totalFees = 1200.0;

    const payments = [
        {
            id: 1,
            title: "Tuition Fee - Fall Semester",
            amount: 800.0,
            date: "Jan 12, 2024",
            status: "Success",
            method: "Card (**** 4421)"
        },
        {
            id: 2,
            title: "Library Lab Access",
            amount: 50.0,
            date: "Feb 05, 2024",
            status: "Success",
            method: "Mobile Money"
        },
        {
            id: 3,
            title: "Examination Fee",
            amount: 150.0,
            date: "Upcoming",
            status: "Pending",
            method: "-"
        }
    ];

    return (
        <div className="student-portal-detail">
            <div className="detail-header">
                <Link to="/student/dashboard" className="back-link">
                    <ArrowLeft size={18} /> Back to Dashboard
                </Link>
                <h1>Pay Fees & Finances</h1>
                <p>Manage your tuition and school fees</p>
                <div className="header-actions">
                    <button className="download-btn-header"><Download size={14} /> Fee Breakdown</button>
                    <button className="security-link"><ShieldCheck size={14} /> Secure Payment System</button>
                </div>
            </div>

            <div className="detail-content">
                <div className="balance-grid">
                    <div className="balance-card primary">
                        <div className="balance-info">
                            <span className="balance-label">Total Outstanding Balance</span>
                            <span className="balance-value">${outstandingBalance.toLocaleString()}</span>
                            <span className="balance-sub">Next due: Feb 28, 2024</span>
                        </div>
                        <div className="balance-action">
                            <button className="btn-pay-now">PAY NOW <CreditCard size={18} /></button>
                        </div>
                    </div>

                    <div className="balance-card">
                        <div className="balance-info">
                            <span className="balance-label">Total Term Fees</span>
                            <span className="balance-value-small">${totalFees.toLocaleString()}</span>
                            <div className="progress-bar-container">
                                <div className="progress-bar-fill" style={{ width: `${((totalFees - outstandingBalance) / totalFees * 100).toFixed(0)}%` }}></div>
                            </div>
                            <span className="balance-footer-text">{((totalFees - outstandingBalance) / totalFees * 100).toFixed(0)}% Paid</span>
                        </div>
                    </div>
                </div>

                <div className="payment-history">
                    <h3>Recent Transactions</h3>
                    <div className="history-matrix">
                        {payments.map(payment => (
                            <div key={payment.id} className="payment-row">
                                <div className="payment-info">
                                    <h4 className="payment-title">{payment.title}</h4>
                                    <span className="payment-meta"><Calendar size={12} /> {payment.date} • {payment.method}</span>
                                </div>
                                <div className="payment-amount">${payment.amount.toLocaleString()}</div>
                                <div className={`payment-status ${payment.status.toLowerCase()}`}>
                                    {payment.status === "Success" ? <CheckCircle size={14} /> : <Clock size={14} />}
                                    {payment.status}
                                </div>
                                <button className="receipt-btn"><Download size={14} /></button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentPayments;
