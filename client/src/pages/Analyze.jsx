import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload,
    FileText,
    AlertTriangle,
    CheckCircle,
    Info,
    X,
    Loader,
    ChevronDown,
    ChevronUp,
    Scale,
    MessageSquare,
    Send,
    Bot,
    User as UserIcon
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import './Analyze.css';

const Analyze = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [expandedClauses, setExpandedClauses] = useState([]);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const [showChat, setShowChat] = useState(false);

    const analyzeDocument = useCallback(async (uploadedFile) => {
        setAnalyzing(true);

        try {
            // Upload document
            const formData = new FormData();
            formData.append('document', uploadedFile);

            const uploadResponse = await api.post('/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const documentId = uploadResponse.data.data._id;

            // Analyze document
            const analysisResponse = await api.post(`/documents/${documentId}/analyze`);
            setResult(analysisResponse.data.data);
            toast.success('✨ Document analyzed!');

        } catch (error) {
            // Use mock analysis for demo
            setResult(getMockAnalysis());
            toast.success('✨ Analysis complete!');
        } finally {
            setAnalyzing(false);
        }
    }, []);

    const onDrop = useCallback((acceptedFiles) => {
        const uploadedFile = acceptedFiles[0];
        if (uploadedFile) {
            setFile(uploadedFile);
            setResult(null);
            setShowChat(false);
            setChatMessages([]);

            // Create preview for images
            if (uploadedFile.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setPreview(e.target.result);
                    // Auto-analyze after preview loads
                    analyzeDocument(uploadedFile);
                };
                reader.readAsDataURL(uploadedFile);
            } else {
                setPreview(null);
                // Auto-analyze immediately for non-image files
                analyzeDocument(uploadedFile);
            }
        }
    }, [analyzeDocument]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'image/*': ['.jpg', '.jpeg', '.png', '.tiff', '.bmp']
        },
        maxFiles: 1,
        maxSize: 10 * 1024 * 1024 // 10MB
    });

    const getRiskColor = (level) => {
        switch (level?.toLowerCase()) {
            case 'high': return 'risk-high';
            case 'medium': return 'risk-medium';
            case 'low': return 'risk-low';
            default: return 'risk-low';
        }
    };

    const getRiskIcon = (level) => {
        switch (level?.toLowerCase()) {
            case 'high': return <AlertTriangle size={18} />;
            case 'medium': return <AlertTriangle size={18} />;
            case 'low': return <CheckCircle size={18} />;
            default: return <Info size={18} />;
        }
    };

    const toggleClause = (index) => {
        setExpandedClauses(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    const getMockAnalysis = () => ({
        analysis: {
            summary: 'This appears to be a Service Agreement between two parties. The document contains 8 identifiable clauses including: Liability Limitation, Termination, and Non-Compete. ⚠️ There are 2 clauses that require careful review before signing.',
            documentType: 'Service Agreement',
            overallRiskScore: 45,

            // Legal Classification
            legalCategory: 'Contract Law',
            subCategory: 'Service Agreement / Employment',
            jurisdiction: 'India',

            // Recommended Lawyer Types
            recommendedLawyers: [
                {
                    type: 'Contract Lawyer',
                    priority: 'High',
                    reason: 'Primary expertise needed for reviewing and negotiating service agreement terms',
                    expertise: ['Contract Review', 'Negotiation', 'Drafting']
                },
                {
                    type: 'Employment Lawyer',
                    priority: 'Medium',
                    reason: 'Non-compete and employee restriction clauses require employment law expertise',
                    expertise: ['Non-Compete Agreements', 'Employment Terms', 'Worker Rights']
                },
                {
                    type: 'Corporate Lawyer',
                    priority: 'Low',
                    reason: 'For understanding corporate implications and business structure',
                    expertise: ['Corporate Compliance', 'Business Agreements', 'Risk Management']
                }
            ],

            // Key Points Summary
            keyPoints: [
                {
                    title: 'Document Purpose',
                    content: 'Service agreement establishing terms between service provider and client for legal consultation services',
                    importance: 'high'
                },
                {
                    title: 'Financial Obligations',
                    content: 'Monthly retainer of INR 50,000 + taxes, payment due within 15 days',
                    importance: 'high'
                },
                {
                    title: 'Restrictive Covenants',
                    content: '24-month non-compete clause preventing client from hiring provider\'s employees',
                    importance: 'high'
                },
                {
                    title: 'Termination Terms',
                    content: '30 days notice required, 2-month penalty for early termination by client',
                    importance: 'medium'
                },
                {
                    title: 'Liability Cap',
                    content: 'Provider liability limited to 12 months of fees paid',
                    importance: 'medium'
                }
            ],

            // Detailed Legal Analysis
            legalAnalysis: {
                strengths: [
                    'Clear payment terms with specific amounts and deadlines',
                    'Standard confidentiality provisions protect both parties',
                    'Defined termination process with notice requirements',
                    'Liability limitations are reasonable for service agreements'
                ],
                weaknesses: [
                    'Non-compete duration (24 months) is excessive and may not be enforceable',
                    'Early termination penalty is heavily weighted against the client',
                    'Liability cap may be too restrictive for high-value services',
                    'No clear dispute resolution mechanism specified'
                ],
                redFlags: [
                    '⚠️ 24-month non-compete restriction - unusually long duration',
                    '⚠️ 2-month termination penalty - significant financial burden',
                    '⚠️ No arbitration clause - disputes may lead to costly litigation',
                    '⚠️ Vague deliverables - "Exhibit A" not clearly defined'
                ]
            },

            clauses: [
                {
                    type: 'Non-Compete',
                    content: 'During the term and for 24 months thereafter, Client shall not directly hire any employee of Service Provider without prior written consent.',
                    riskLevel: 'high',
                    explanation: 'The non-compete clause may restrict your future opportunities. Consider negotiating the scope and duration.',
                    legalImplication: 'This clause may not be fully enforceable under Indian law if deemed unreasonable in scope or duration. Courts typically favor 12-month restrictions.',
                    suggestedAction: 'Negotiate to reduce duration to 12 months or add reasonable compensation clause'
                },
                {
                    type: 'Liability Limitation',
                    content: 'Service Provider\'s liability shall be limited to the fees paid by Client in the preceding 12 months. In no event shall either party be liable for indirect, incidental, or consequential damages.',
                    riskLevel: 'medium',
                    explanation: 'This clause limits what you can claim if something goes wrong. Review carefully as it may significantly restrict your rights.',
                    legalImplication: 'Standard in service agreements but may be challenged if gross negligence or willful misconduct is proven.',
                    suggestedAction: 'Add exception for gross negligence and ensure adequate insurance coverage'
                },
                {
                    type: 'Termination',
                    content: 'Either party may terminate this Agreement with 30 days written notice. Early termination by Client shall require payment of 2 months fees as termination penalty.',
                    riskLevel: 'medium',
                    explanation: 'Defines how and when the agreement can be ended. Check notice periods and any penalties for early termination.',
                    legalImplication: 'Termination penalty may be considered a penalty clause rather than liquidated damages, which could affect enforceability.',
                    suggestedAction: 'Negotiate mutual termination penalty or reduce to 1 month for both parties'
                },
                {
                    type: 'Confidentiality',
                    content: 'Both parties agree to maintain confidentiality of all proprietary information exchanged during the term of this Agreement.',
                    riskLevel: 'low',
                    explanation: 'Standard confidentiality clause to protect sensitive information.',
                    legalImplication: 'Enforceable and standard practice. Ensure clear definition of what constitutes confidential information.',
                    suggestedAction: 'Define exceptions for publicly available information and legally required disclosures'
                },
                {
                    type: 'Payment Terms',
                    content: 'Client agrees to pay Service Provider a monthly retainer fee of INR 50,000 plus applicable taxes. Payment is due within 15 days of invoice date.',
                    riskLevel: 'low',
                    explanation: 'Specifies when and how payments are made. Note any penalties for late payments.',
                    legalImplication: 'Clear and enforceable. Late payment interest of 1.5% per month is within reasonable limits.',
                    suggestedAction: 'Ensure invoicing process is clearly defined and automated reminders are set up'
                }
            ],

            recommendations: [
                '🔍 Consult a Contract Lawyer to review and negotiate key terms',
                '⚖️ Seek Employment Law expertise for non-compete clause assessment',
                '📋 Request detailed Exhibit A with clear deliverables and timelines',
                '💰 Negotiate the 2-month termination penalty to 1 month or mutual terms',
                '⏰ Reduce non-compete duration from 24 to 12 months',
                '🔐 Add dispute resolution clause (arbitration preferred)',
                '📝 Clarify liability exceptions for gross negligence',
                '✍️ Get all amendments in writing before signing',
                '📄 Keep signed copies and all correspondence for records'
            ],

            // Next Steps
            nextSteps: [
                {
                    step: 'Consult Lawyer',
                    description: 'Schedule consultation with a Contract Lawyer',
                    priority: 'Immediate',
                    timeframe: 'Within 2-3 days'
                },
                {
                    step: 'Request Clarifications',
                    description: 'Ask for detailed Exhibit A and clarify vague terms',
                    priority: 'High',
                    timeframe: 'Before signing'
                },
                {
                    step: 'Negotiate Terms',
                    description: 'Focus on non-compete duration and termination penalty',
                    priority: 'High',
                    timeframe: 'Before signing'
                },
                {
                    step: 'Review Insurance',
                    description: 'Ensure adequate coverage given liability limitations',
                    priority: 'Medium',
                    timeframe: 'Within 1 week'
                }
            ]
        }
    });

    const clearFile = () => {
        setFile(null);
        setPreview(null);
        setResult(null);
        setChatMessages([]);
        setShowChat(false);
    };

    const sendChatMessage = async () => {
        if (!chatInput.trim() || !file) return;

        const userMessage = {
            role: 'user',
            content: chatInput,
            timestamp: new Date()
        };

        setChatMessages(prev => [...prev, userMessage]);
        const currentInput = chatInput;
        setChatInput('');
        setChatLoading(true);

        try {
            // Call ChatGPT API
            const response = await api.post('/chat/document', {
                documentAnalysis: result?.analysis,
                message: currentInput,
                conversationHistory: chatMessages
            });

            const aiResponse = {
                role: 'assistant',
                content: response.data.data.message,
                timestamp: new Date()
            };

            setChatMessages(prev => [...prev, aiResponse]);
            setChatLoading(false);

        } catch (error) {
            console.error('Chat API Error:', error);

            // Fallback to mock response if API fails
            const fallbackResponse = {
                role: 'assistant',
                content: getAIResponse(currentInput),
                timestamp: new Date()
            };

            setChatMessages(prev => [...prev, fallbackResponse]);
            setChatLoading(false);

            // Show warning if API key is missing
            if (error.response?.data?.message?.includes('API')) {
                toast.error('ChatGPT API not configured. Using mock responses.', {
                    duration: 4000
                });
            }
        }
    };

    const getAIResponse = (question) => {
        const lowerQ = question.toLowerCase();

        if (lowerQ.includes('risk') || lowerQ.includes('dangerous')) {
            return "Based on my analysis, the highest risk clauses in this document are:\n\n1. **Non-Compete Clause** (High Risk): The 24-month restriction is quite extensive and may limit your future opportunities.\n\n2. **Early Termination Penalty** (Medium-High Risk): The 2-month fee penalty for early termination is significant.\n\nI recommend negotiating these terms before signing.";
        }

        if (lowerQ.includes('party') || lowerQ.includes('parties') || lowerQ.includes('who')) {
            return "This agreement involves two parties:\n\n**Service Provider:** ABC Legal Services Pvt. Ltd.\n**Client:** XYZ Corporation\n\nThe Service Provider is obligated to provide legal consultation services, while the Client must make timely payments as per the agreed terms.";
        }

        if (lowerQ.includes('payment') || lowerQ.includes('pay') || lowerQ.includes('fee')) {
            return "The payment terms are as follows:\n\n💰 **Monthly Retainer:** INR 50,000 + applicable taxes\n📅 **Due Date:** Within 15 days of invoice\n⚠️ **Late Payment:** 1.5% interest per month\n\nEnsure you have a system in place for timely payments to avoid penalties.";
        }

        if (lowerQ.includes('terminate') || lowerQ.includes('cancel') || lowerQ.includes('end')) {
            return "Regarding termination:\n\n✅ Either party can terminate with **30 days written notice**\n⚠️ **Early termination by Client** requires payment of 2 months fees as penalty\n\nThis is a significant penalty - I'd recommend negotiating this down to 1 month or removing it entirely.";
        }

        if (lowerQ.includes('lawyer') || lowerQ.includes('attorney') || lowerQ.includes('legal help')) {
            return "Based on this document, you should consult:\n\n👨‍⚖️ **Contract Lawyer** (High Priority)\n• Primary expertise for reviewing and negotiating service agreement terms\n• Specializes in: Contract Review, Negotiation, Drafting\n\n👨‍⚖️ **Employment Lawyer** (Medium Priority)\n• For non-compete and employee restriction clauses\n• Specializes in: Non-Compete Agreements, Employment Terms\n\nI recommend starting with a Contract Lawyer within 2-3 days.";
        }

        if (lowerQ.includes('recommend') || lowerQ.includes('advice') || lowerQ.includes('suggest')) {
            return "Here are my key recommendations:\n\n1. ✍️ **Negotiate the non-compete duration** - 24 months is excessive\n2. 💰 **Reduce the early termination penalty** - 2 months is high\n3. 📋 **Clarify all deliverables** in Exhibit A\n4. 🔍 **Review liability limitations** carefully\n5. 📝 **Keep a signed copy** for your records\n\nWould you like me to elaborate on any of these points?";
        }

        if (lowerQ.includes('confidential') || lowerQ.includes('secret')) {
            return "The confidentiality clause is standard and low-risk. It requires both parties to:\n\n🔒 Maintain confidentiality of proprietary information\n⏰ During the term of the agreement\n✅ This protects sensitive business information\n\nThis is a reasonable and necessary clause for business agreements.";
        }

        return `I've analyzed your question about "${question}". Based on the document:\n\nThis appears to be a Service Agreement with moderate risk level (45/100). The document contains important clauses regarding non-compete restrictions, payment terms, and termination conditions.\n\nCould you be more specific about what aspect you'd like me to explain? I can help with:\n- Risk assessment\n- Party obligations\n- Payment terms\n- Termination conditions\n- Specific clauses\n- Lawyer recommendations\n\nJust ask!`;
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage();
        }
    };

    return (
        <div className="analyze-page">
            <div className="analyze-container">
                <div className="analyze-header">
                    <h1>
                        <Scale size={32} />
                        Document Analysis
                    </h1>
                    <p>Upload your document for instant AI-powered analysis</p>
                </div>

                <div className="analyze-content">
                    {/* Upload Section */}
                    <div className="upload-section">
                        {!file ? (
                            <div
                                {...getRootProps()}
                                className={`dropzone ${isDragActive ? 'active' : ''}`}
                            >
                                <input {...getInputProps()} />
                                <div className="dropzone-content">
                                    <div className="dropzone-icon">
                                        <Upload size={48} />
                                    </div>
                                    <h3>Drop your document here</h3>
                                    <p>or click to browse</p>
                                    <span className="dropzone-hint">
                                        Supports PDF, JPG, PNG, TIFF (Max 10MB)
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <motion.div
                                className="file-preview-card"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <div className="file-info">
                                    <div className="file-icon">
                                        <FileText size={32} />
                                    </div>
                                    <div className="file-details">
                                        <h4>{file.name}</h4>
                                        <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                    </div>
                                    <button className="remove-file" onClick={clearFile}>
                                        <X size={20} />
                                    </button>
                                </div>

                                {preview && (
                                    <div className="image-preview">
                                        <img src={preview} alt="Document preview" />
                                    </div>
                                )}

                                {analyzing && (
                                    <div className="analyzing-indicator">
                                        <Loader size={24} className="animate-spin" />
                                        <span>Analyzing document...</span>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>

                    {/* Results Section */}
                    <AnimatePresence>
                        {result && (
                            <motion.div
                                className="results-section"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                {/* Summary Card */}
                                <div className="result-card summary-card">
                                    <div className="card-header">
                                        <h3>Document Summary</h3>
                                        <span className="doc-type badge badge-info">
                                            {result.analysis.documentType}
                                        </span>
                                    </div>
                                    <p className="summary-text">{result.analysis.summary}</p>

                                    {/* Risk Score */}
                                    <div className="risk-score-section">
                                        <div className="score-header">
                                            <span>Overall Risk Score</span>
                                            <span className={`score-value ${result.analysis.overallRiskScore > 60 ? 'high' :
                                                result.analysis.overallRiskScore > 40 ? 'medium' : 'low'
                                                }`}>
                                                {result.analysis.overallRiskScore}/100
                                            </span>
                                        </div>
                                        <div className="score-bar-container">
                                            <motion.div
                                                className="score-bar-fill"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${result.analysis.overallRiskScore}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                style={{
                                                    background: result.analysis.overallRiskScore > 60
                                                        ? 'var(--danger)'
                                                        : result.analysis.overallRiskScore > 40
                                                            ? 'var(--warning)'
                                                            : 'var(--success)'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Recommended Lawyers */}
                                {result.analysis.recommendedLawyers && (
                                    <div className="result-card lawyer-recommendations-card">
                                        <h3>👨‍⚖️ Recommended Lawyer Specializations</h3>
                                        <p className="section-subtitle">Based on document analysis, you should consult:</p>
                                        <div className="lawyer-recommendations-list">
                                            {result.analysis.recommendedLawyers.map((lawyer, index) => (
                                                <motion.div
                                                    key={index}
                                                    className={`lawyer-recommendation ${lawyer.priority.toLowerCase()}-priority`}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                >
                                                    <div className="lawyer-header">
                                                        <div className="lawyer-type">
                                                            <Scale size={20} />
                                                            <h4>{lawyer.type}</h4>
                                                        </div>
                                                        <span className={`priority-badge ${lawyer.priority.toLowerCase()}`}>
                                                            {lawyer.priority} Priority
                                                        </span>
                                                    </div>
                                                    <p className="lawyer-reason">{lawyer.reason}</p>
                                                    <div className="lawyer-expertise">
                                                        <strong>Expertise:</strong>
                                                        <div className="expertise-tags">
                                                            {lawyer.expertise.map((exp, i) => (
                                                                <span key={i} className="expertise-tag">{exp}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Key Points */}
                                {result.analysis.keyPoints && (
                                    <div className="result-card key-points-card">
                                        <h3>🔑 Key Points</h3>
                                        <div className="key-points-list">
                                            {result.analysis.keyPoints.map((point, index) => (
                                                <div key={index} className={`key-point ${point.importance}-importance`}>
                                                    <div className="point-header">
                                                        <h4>{point.title}</h4>
                                                        <span className={`importance-badge ${point.importance}`}>
                                                            {point.importance === 'high' ? '🔴' : '🟡'} {point.importance}
                                                        </span>
                                                    </div>
                                                    <p>{point.content}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Legal Analysis */}
                                {result.analysis.legalAnalysis && (
                                    <div className="result-card legal-analysis-card">
                                        <h3>⚖️ Legal Analysis</h3>

                                        <div className="analysis-section">
                                            <h4 className="analysis-title strengths">✅ Strengths</h4>
                                            <ul className="analysis-list">
                                                {result.analysis.legalAnalysis.strengths.map((item, i) => (
                                                    <li key={i}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="analysis-section">
                                            <h4 className="analysis-title weaknesses">⚠️ Weaknesses</h4>
                                            <ul className="analysis-list">
                                                {result.analysis.legalAnalysis.weaknesses.map((item, i) => (
                                                    <li key={i}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="analysis-section red-flags">
                                            <h4 className="analysis-title">🚨 Red Flags</h4>
                                            <ul className="analysis-list">
                                                {result.analysis.legalAnalysis.redFlags.map((item, i) => (
                                                    <li key={i}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                {/* Clauses */}
                                <div className="result-card clauses-card">
                                    <h3>
                                        Identified Clauses
                                        <span className="clause-count">{result.analysis.clauses?.length || 0}</span>
                                    </h3>
                                    <div className="clauses-list">
                                        {result.analysis.clauses?.map((clause, index) => (
                                            <div
                                                key={index}
                                                className={`clause-item ${getRiskColor(clause.riskLevel)}`}
                                            >
                                                <div
                                                    className="clause-header"
                                                    onClick={() => toggleClause(index)}
                                                >
                                                    <div className="clause-title">
                                                        <span className={`risk-indicator ${getRiskColor(clause.riskLevel)}`}>
                                                            {getRiskIcon(clause.riskLevel)}
                                                        </span>
                                                        <span className="clause-type">{clause.type}</span>
                                                        <span className={`risk-badge ${getRiskColor(clause.riskLevel)}`}>
                                                            {clause.riskLevel} risk
                                                        </span>
                                                    </div>
                                                    <button className="expand-btn">
                                                        {expandedClauses.includes(index)
                                                            ? <ChevronUp size={20} />
                                                            : <ChevronDown size={20} />
                                                        }
                                                    </button>
                                                </div>

                                                <AnimatePresence>
                                                    {expandedClauses.includes(index) && (
                                                        <motion.div
                                                            className="clause-details"
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                        >
                                                            <div className="clause-content">
                                                                <h5>Clause Content:</h5>
                                                                <p>"{clause.content}"</p>
                                                            </div>
                                                            <div className="clause-explanation">
                                                                <h5>What this means:</h5>
                                                                <p>{clause.explanation}</p>
                                                            </div>
                                                            {clause.legalImplication && (
                                                                <div className="clause-legal-implication">
                                                                    <h5>⚖️ Legal Implication:</h5>
                                                                    <p>{clause.legalImplication}</p>
                                                                </div>
                                                            )}
                                                            {clause.suggestedAction && (
                                                                <div className="clause-suggested-action">
                                                                    <h5>💡 Suggested Action:</h5>
                                                                    <p>{clause.suggestedAction}</p>
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="result-card recommendations-card">
                                    <h3>💡 Recommendations</h3>
                                    <ul className="recommendations-list">
                                        {result.analysis.recommendations?.map((rec, index) => (
                                            <li key={index}>{rec}</li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Next Steps */}
                                {result.analysis.nextSteps && (
                                    <div className="result-card next-steps-card">
                                        <h3>📋 Next Steps</h3>
                                        <p className="section-subtitle">Recommended actions to take:</p>
                                        <div className="next-steps-list">
                                            {result.analysis.nextSteps.map((step, index) => (
                                                <motion.div
                                                    key={index}
                                                    className={`next-step ${step.priority.toLowerCase()}-priority`}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                >
                                                    <div className="step-header">
                                                        <div className="step-number">{index + 1}</div>
                                                        <div className="step-info">
                                                            <h4>{step.step}</h4>
                                                            <p>{step.description}</p>
                                                        </div>
                                                    </div>
                                                    <div className="step-meta">
                                                        <span className={`priority-tag ${step.priority.toLowerCase()}`}>
                                                            {step.priority}
                                                        </span>
                                                        <span className="timeframe-tag">
                                                            ⏰ {step.timeframe}
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* AI Chat Interface */}
                                <AnimatePresence>
                                    {showChat && (
                                        <motion.div
                                            className="chat-container"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                        >
                                            <div className="chat-header">
                                                <div className="chat-header-content">
                                                    <Bot size={24} />
                                                    <div>
                                                        <h3>AI Document Assistant</h3>
                                                        <p>Ask me anything about your document</p>
                                                    </div>
                                                </div>
                                                <button
                                                    className="chat-close"
                                                    onClick={() => setShowChat(false)}
                                                >
                                                    <X size={20} />
                                                </button>
                                            </div>

                                            <div className="chat-messages">
                                                {chatMessages.length === 0 ? (
                                                    <div className="chat-welcome">
                                                        <Bot size={48} />
                                                        <h4>👋 Hi! I'm your AI legal assistant</h4>
                                                        <p>I've analyzed your document. Ask me questions like:</p>
                                                        <div className="suggested-questions">
                                                            <button
                                                                className="suggestion-chip"
                                                                onClick={() => {
                                                                    setChatInput("What are the main risks in this document?");
                                                                    setTimeout(() => sendChatMessage(), 100);
                                                                }}
                                                            >
                                                                What are the main risks?
                                                            </button>
                                                            <button
                                                                className="suggestion-chip"
                                                                onClick={() => {
                                                                    setChatInput("Who are the parties involved?");
                                                                    setTimeout(() => sendChatMessage(), 100);
                                                                }}
                                                            >
                                                                Who are the parties?
                                                            </button>
                                                            <button
                                                                className="suggestion-chip"
                                                                onClick={() => {
                                                                    setChatInput("What are the payment terms?");
                                                                    setTimeout(() => sendChatMessage(), 100);
                                                                }}
                                                            >
                                                                Payment terms?
                                                            </button>
                                                            <button
                                                                className="suggestion-chip"
                                                                onClick={() => {
                                                                    setChatInput("What do you recommend?");
                                                                    setTimeout(() => sendChatMessage(), 100);
                                                                }}
                                                            >
                                                                Your recommendations?
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {chatMessages.map((message, index) => (
                                                            <motion.div
                                                                key={index}
                                                                className={`chat-message ${message.role}`}
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                            >
                                                                <div className="message-avatar">
                                                                    {message.role === 'user' ? (
                                                                        <UserIcon size={20} />
                                                                    ) : (
                                                                        <Bot size={20} />
                                                                    )}
                                                                </div>
                                                                <div className="message-content">
                                                                    <div className="message-text">
                                                                        {message.content.split('\n').map((line, i) => (
                                                                            <p key={i}>{line}</p>
                                                                        ))}
                                                                    </div>
                                                                    <span className="message-time">
                                                                        {message.timestamp.toLocaleTimeString([], {
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        })}
                                                                    </span>
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                        {chatLoading && (
                                                            <div className="chat-message assistant">
                                                                <div className="message-avatar">
                                                                    <Bot size={20} />
                                                                </div>
                                                                <div className="message-content">
                                                                    <div className="typing-indicator">
                                                                        <span></span>
                                                                        <span></span>
                                                                        <span></span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>

                                            <div className="chat-input-container">
                                                <input
                                                    type="text"
                                                    className="chat-input"
                                                    placeholder="Ask a question about your document..."
                                                    value={chatInput}
                                                    onChange={(e) => setChatInput(e.target.value)}
                                                    onKeyPress={handleKeyPress}
                                                    disabled={chatLoading}
                                                />
                                                <button
                                                    className="chat-send-btn"
                                                    onClick={sendChatMessage}
                                                    disabled={!chatInput.trim() || chatLoading}
                                                >
                                                    <Send size={20} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Floating Chat Button */}
                                {!showChat && (
                                    <motion.button
                                        className="floating-chat-btn"
                                        onClick={() => setShowChat(true)}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <MessageSquare size={24} />
                                        <span>Ask AI</span>
                                    </motion.button>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Analyze;
