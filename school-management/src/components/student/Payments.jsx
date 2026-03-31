import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../lib/api";
import { Link } from "react-router-dom";
import { ArrowLeft, DollarSign, Clock, CheckCircle, AlertCircle, Calendar, CreditCard, Download, ShieldCheck, Inbox } from "lucide-react";
import "./StudentFeatures.css";

const StudentPayments = () => {
    const { user } = useAuth();
    const [payments, setPayments] = useState([]);
    const [balance, setBalance] = useState({ outstanding: 0, total: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPaymentData = async () => {
            setLoading(true);
            try {
                const student = await api.getStudentPortalMe();
                const [feeBalance, feeList] = await Promise.all([
                    api.getStudentFeeBalance(student.id),
                    api.getStudentFees(student.id)
                ]);

                const outstanding = feeBalance || 0;
                const txns = Array.isArray(feeList) ? feeList : [];
                
                // Calculate total fees by summing all transaction amounts
                const total = txns.reduce((acc, curr) => acc + curr.amount, 0);

                const mappedPayments = txns.map(p => ({
                    id: p.id,
                    title: p.feeType || "School Fee",
                    amount: p.amount,
                    date: new Date(p.createdAt).toLocaleDateString(),
                    status: p.status === "PAID" ? "Success" : "Pending",
                    method: p.paymentMethod || "-"
                }));

                setPayments(mappedPayments);
                setBalance({ outstanding, total });
            } catch (err) {
                console.error("Failed to fetch payment data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPaymentData();
    }, []);

    if (loading) {
        return (
            <div className="student-portal-detail">
                <div className="loading-container">
                    <div className="loader"></div>
                    <p>Loading your financial records...</p>
                </div>
            </div>
        );
    }

    const paidAmount = balance.total - balance.outstanding;
    const paidPercentage = balance.total > 0 ? (paidAmount / balance.total) * 100 : 0;

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
                            <span className="balance-value">GH₵{balance.outstanding.toLocaleString()}</span>
                            <span className="balance-sub">Please settle outstanding fees soon.</span>
                        </div>
                        <div className="balance-action">
                            <button className="btn-pay-now">PAY NOW <CreditCard size={18} /></button>
                        </div>
                    </div>

                    <div className="balance-card">
                        <div className="balance-info">
                            <span className="balance-label">Total Term Fees</span>
                            <span className="balance-value-small">GH₵{balance.total.toLocaleString()}</span>
                            <div className="progress-bar-container">
                                <div className="progress-bar-fill" style={{ width: `${paidPercentage}%` }}></div>
                            </div>
                            <span className="balance-footer-text">{paidPercentage.toFixed(0)}% Paid</span>
                        </div>
                    </div>
                </div>

                <div className="payment-history">
                    <h3>Recent Transactions</h3>
                    {payments.length > 0 ? (
                        <div className="history-matrix">
                            {payments.map(payment => (
                                <div key={payment.id} className="payment-row">
                                    <div className="payment-info">
                                        <h4 className="payment-title">{payment.title}</h4>
                                        <span className="payment-meta"><Calendar size={12} /> {payment.date} • {payment.method}</span>
                                    </div>
                                    <div className="payment-amount">GH₵{payment.amount.toLocaleString()}</div>
                                    <div className={`payment-status ${payment.status.toLowerCase()}`}>
                                        {payment.status === "Success" ? <CheckCircle size={14} /> : <Clock size={14} />}
                                        {payment.status}
                                    </div>
                                    <button className="receipt-btn"><Download size={14} /></button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state-detail">
                            <Inbox size={48} />
                            <h3>No transactions found</h3>
                            <p>You haven't made any payments yet for this term.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentPayments;
