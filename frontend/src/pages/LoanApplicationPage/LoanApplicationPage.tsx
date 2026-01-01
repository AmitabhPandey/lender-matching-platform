import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { Button } from "../../components/Button";
import { Loading } from "../../components/Loading";
import { ErrorMessage } from "../../components/ErrorMessage";
import { Card } from "../../components/Card";
import { submitApplication } from "../../api/applicationService";
import {
  FormData,
  initialFormData,
  LoanApplication,
  ApplicationSubmitResponse,
} from "../../types/application.types";
import styles from "./LoanApplicationPage.module.css";

export const LoanApplicationPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApplicationSubmitResponse | null>(null);

  const steps = [
    "Business Information",
    "Credit Information",
    "Loan Details",
    "Equipment Information",
    "Contact Information",
    "Review & Submit",
  ];

  const updateFormData = (section: keyof FormData, data: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...data },
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const application: LoanApplication = {
        business_info: formData.businessInfo as any,
        credit_info: formData.creditInfo as any,
        loan_details: formData.loanDetails as any,
        equipment_info: formData.equipmentInfo as any,
        contact_info: formData.contactInfo as any,
        additional_notes: formData.additionalNotes,
      };

      const response = await submitApplication(application);
      setResult(response);
      setCurrentStep(steps.length); // Move to results view
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show results if available
  if (result) {
    return (
      <Layout>
        <div className={styles.container}>
          <h1>Eligibility Results</h1>

          <div className={styles.resultsSummary}>
            <Card>
              <h2>Analysis Complete</h2>
              <p>
                Evaluated against {result.eligibility.total_lenders_evaluated}{" "}
                lenders
              </p>
              <p>
                <strong>{result.eligibility.matched_lenders.length}</strong>{" "}
                lenders matched your criteria
              </p>
            </Card>
          </div>

          {result.eligibility.matched_lenders.length > 0 && (
            <div className={styles.matchedSection}>
              <h2 className={styles.sectionTitle}>✅ Matched Lenders</h2>
              {result.eligibility.matched_lenders.map((match) => (
                <Card key={match.lender_id} className={styles.lenderCard}>
                  <div className={styles.lenderHeader}>
                    <h3>{match.lender_name}</h3>
                    <span className={styles.confidence}>
                      {(match.confidence_score * 100).toFixed(0)}% Match
                    </span>
                  </div>
                  <p className={styles.reasoning}>{match.overall_reasoning}</p>

                  <details className={styles.criteriaDetails}>
                    <summary>
                      View Criteria Breakdown (
                      {match.criteria_evaluations.length})
                    </summary>
                    <div className={styles.criteriaList}>
                      {match.criteria_evaluations.map((criteria, idx) => (
                        <div key={idx} className={styles.criteriaItem}>
                          <span
                            className={
                              criteria.met ? styles.met : styles.notMet
                            }
                          >
                            {criteria.met ? "✓" : "✗"}
                          </span>
                          <div>
                            <strong>{criteria.display_name}</strong>
                            <p>{criteria.reasoning}</p>
                            <small>
                              Required:{" "}
                              {JSON.stringify(criteria.required_value)} | Your
                              Value: {JSON.stringify(criteria.actual_value)}
                            </small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                </Card>
              ))}
            </div>
          )}

          {result.eligibility.unmatched_lenders.length > 0 && (
            <div className={styles.unmatchedSection}>
              <h2 className={styles.sectionTitle}>❌ Unmatched Lenders</h2>
              {result.eligibility.unmatched_lenders.map((match) => (
                <Card key={match.lender_id} className={styles.lenderCard}>
                  <div className={styles.lenderHeader}>
                    <h3>{match.lender_name}</h3>
                    <span className={styles.confidenceLow}>
                      {(match.confidence_score * 100).toFixed(0)}% Match
                    </span>
                  </div>
                  <p className={styles.reasoning}>{match.overall_reasoning}</p>

                  {match.improvement_suggestions &&
                    match.improvement_suggestions.length > 0 && (
                      <div className={styles.suggestions}>
                        <strong>💡 Improvement Suggestions:</strong>
                        <ul>
                          {match.improvement_suggestions.map(
                            (suggestion, idx) => (
                              <li key={idx}>{suggestion}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  <details className={styles.criteriaDetails}>
                    <summary>
                      View Criteria Breakdown (
                      {match.criteria_evaluations.length})
                    </summary>
                    <div className={styles.criteriaList}>
                      {match.criteria_evaluations.map((criteria, idx) => (
                        <div key={idx} className={styles.criteriaItem}>
                          <span
                            className={
                              criteria.met ? styles.met : styles.notMet
                            }
                          >
                            {criteria.met ? "✓" : "✗"}
                          </span>
                          <div>
                            <strong>{criteria.display_name}</strong>
                            <p>{criteria.reasoning}</p>
                            <small>
                              Required:{" "}
                              {JSON.stringify(criteria.required_value)} | Your
                              Value: {JSON.stringify(criteria.actual_value)}
                            </small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                </Card>
              ))}
            </div>
          )}

          <div className={styles.actions}>
            <Button variant="secondary" onClick={() => navigate("/")}>
              Back to Home
            </Button>
            <Button onClick={() => window.location.reload()}>
              Submit Another Application
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Show form
  return (
    <Layout>
      <div className={styles.container}>
        <h1>Loan Application</h1>
        <p className={styles.subtitle}>
          Complete the form below to see which lenders match your needs
        </p>

        {/* Progress Indicator */}
        <div className={styles.progressBar}>
          {steps.map((step, index) => (
            <div
              key={index}
              className={`${styles.progressStep} ${
                index <= currentStep ? styles.active : ""
              }`}
            >
              <div className={styles.stepNumber}>{index + 1}</div>
              <span className={styles.stepLabel}>{step}</span>
            </div>
          ))}
        </div>

        {error && <ErrorMessage message={error} />}

        <Card>
          {/* Step 0: Business Information */}
          {currentStep === 0 && (
            <div className={styles.formSection}>
              <h2>Business Information</h2>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Business Name *</label>
                  <input
                    type="text"
                    value={formData.businessInfo.business_name}
                    onChange={(e) =>
                      updateFormData("businessInfo", {
                        business_name: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Business Type *</label>
                  <select
                    value={formData.businessInfo.business_type}
                    onChange={(e) =>
                      updateFormData("businessInfo", {
                        business_type: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Select...</option>
                    <option value="LLC">LLC</option>
                    <option value="Corporation">Corporation</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Sole Proprietorship">
                      Sole Proprietorship
                    </option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Industry *</label>
                  <input
                    type="text"
                    value={formData.businessInfo.industry}
                    onChange={(e) =>
                      updateFormData("businessInfo", {
                        industry: e.target.value,
                      })
                    }
                    placeholder="e.g., Transportation, Construction"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Years in Business *</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.businessInfo.years_in_business}
                    onChange={(e) =>
                      updateFormData("businessInfo", {
                        years_in_business: parseFloat(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Annual Revenue</label>
                  <input
                    type="number"
                    value={formData.businessInfo.annual_revenue || ""}
                    onChange={(e) =>
                      updateFormData("businessInfo", {
                        annual_revenue: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="Optional"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Number of Employees</label>
                  <input
                    type="number"
                    value={formData.businessInfo.number_of_employees || ""}
                    onChange={(e) =>
                      updateFormData("businessInfo", {
                        number_of_employees: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Credit Information */}
          {currentStep === 1 && (
            <div className={styles.formSection}>
              <h2>Credit Information</h2>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>FICO Score *</label>
                  <input
                    type="number"
                    min="300"
                    max="850"
                    value={formData.creditInfo.fico_score}
                    onChange={(e) =>
                      updateFormData("creditInfo", {
                        fico_score: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>PayNet Score</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.creditInfo.paynet_score || ""}
                    onChange={(e) =>
                      updateFormData("creditInfo", {
                        paynet_score: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="Optional"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.creditInfo.has_bankruptcy}
                      onChange={(e) =>
                        updateFormData("creditInfo", {
                          has_bankruptcy: e.target.checked,
                        })
                      }
                    />{" "}
                    Has Bankruptcy
                  </label>
                </div>
                {formData.creditInfo.has_bankruptcy && (
                  <div className={styles.formGroup}>
                    <label>Bankruptcy Discharge Date</label>
                    <input
                      type="date"
                      value={
                        formData.creditInfo.bankruptcy_discharge_date || ""
                      }
                      onChange={(e) =>
                        updateFormData("creditInfo", {
                          bankruptcy_discharge_date: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
                <div className={styles.formGroup}>
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.creditInfo.has_judgments}
                      onChange={(e) =>
                        updateFormData("creditInfo", {
                          has_judgments: e.target.checked,
                        })
                      }
                    />{" "}
                    Has Judgments
                  </label>
                </div>
                <div className={styles.formGroup}>
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.creditInfo.has_foreclosure}
                      onChange={(e) =>
                        updateFormData("creditInfo", {
                          has_foreclosure: e.target.checked,
                        })
                      }
                    />{" "}
                    Has Foreclosure
                  </label>
                </div>
                <div className={styles.formGroup}>
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.creditInfo.has_repossession}
                      onChange={(e) =>
                        updateFormData("creditInfo", {
                          has_repossession: e.target.checked,
                        })
                      }
                    />{" "}
                    Has Repossession
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Loan Details */}
          {currentStep === 2 && (
            <div className={styles.formSection}>
              <h2>Loan Details</h2>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Requested Amount *</label>
                  <input
                    type="number"
                    value={formData.loanDetails.requested_amount}
                    onChange={(e) =>
                      updateFormData("loanDetails", {
                        requested_amount: parseFloat(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Down Payment *</label>
                  <input
                    type="number"
                    value={formData.loanDetails.down_payment}
                    onChange={(e) =>
                      updateFormData("loanDetails", {
                        down_payment: parseFloat(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Loan Term (months) *</label>
                  <input
                    type="number"
                    value={formData.loanDetails.loan_term_months}
                    onChange={(e) =>
                      updateFormData("loanDetails", {
                        loan_term_months: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Loan Purpose *</label>
                  <input
                    type="text"
                    value={formData.loanDetails.loan_purpose}
                    onChange={(e) =>
                      updateFormData("loanDetails", {
                        loan_purpose: e.target.value,
                      })
                    }
                    placeholder="e.g., Equipment Purchase"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Equipment Information */}
          {currentStep === 3 && (
            <div className={styles.formSection}>
              <h2>Equipment Information</h2>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Equipment Type *</label>
                  <input
                    type="text"
                    value={formData.equipmentInfo.equipment_type}
                    onChange={(e) =>
                      updateFormData("equipmentInfo", {
                        equipment_type: e.target.value,
                      })
                    }
                    placeholder="e.g., Class 8 Truck"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Equipment Category *</label>
                  <input
                    type="text"
                    value={formData.equipmentInfo.equipment_category}
                    onChange={(e) =>
                      updateFormData("equipmentInfo", {
                        equipment_category: e.target.value,
                      })
                    }
                    placeholder="e.g., Heavy Duty Trucks"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Equipment Age (years)</label>
                  <input
                    type="number"
                    value={formData.equipmentInfo.equipment_age_years || ""}
                    onChange={(e) =>
                      updateFormData("equipmentInfo", {
                        equipment_age_years: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="Optional"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Equipment Condition *</label>
                  <select
                    value={formData.equipmentInfo.equipment_condition}
                    onChange={(e) =>
                      updateFormData("equipmentInfo", {
                        equipment_condition: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Select...</option>
                    <option value="New">New</option>
                    <option value="Used">Used</option>
                    <option value="Refurbished">Refurbished</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Purchase Type *</label>
                  <select
                    value={formData.equipmentInfo.purchase_type}
                    onChange={(e) =>
                      updateFormData("equipmentInfo", {
                        purchase_type: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Select...</option>
                    <option value="Dealer">Dealer</option>
                    <option value="Private Party">Private Party</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Equipment Mileage</label>
                  <input
                    type="number"
                    value={formData.equipmentInfo.equipment_mileage || ""}
                    onChange={(e) =>
                      updateFormData("equipmentInfo", {
                        equipment_mileage: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Contact Information */}
          {currentStep === 4 && (
            <div className={styles.formSection}>
              <h2>Contact Information</h2>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Contact Name *</label>
                  <input
                    type="text"
                    value={formData.contactInfo.contact_name}
                    onChange={(e) =>
                      updateFormData("contactInfo", {
                        contact_name: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.contactInfo.email}
                    onChange={(e) =>
                      updateFormData("contactInfo", { email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Phone *</label>
                  <input
                    type="tel"
                    value={formData.contactInfo.phone}
                    onChange={(e) =>
                      updateFormData("contactInfo", { phone: e.target.value })
                    }
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>State *</label>
                  <input
                    type="text"
                    value={formData.contactInfo.state}
                    onChange={(e) =>
                      updateFormData("contactInfo", { state: e.target.value })
                    }
                    placeholder="e.g., TX"
                    required
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Additional Notes</label>
                <textarea
                  value={formData.additionalNotes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      additionalNotes: e.target.value,
                    })
                  }
                  rows={4}
                  placeholder="Any additional information..."
                />
              </div>
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {currentStep === 5 && (
            <div className={styles.formSection}>
              <h2>Review Your Application</h2>
              <div className={styles.reviewSection}>
                <h3>Business Information</h3>
                <p>Name: {formData.businessInfo.business_name}</p>
                <p>Type: {formData.businessInfo.business_type}</p>
                <p>Industry: {formData.businessInfo.industry}</p>
                <p>
                  Years in Business: {formData.businessInfo.years_in_business}
                </p>

                <h3>Credit Information</h3>
                <p>FICO Score: {formData.creditInfo.fico_score}</p>
                <p>
                  Has Bankruptcy:{" "}
                  {formData.creditInfo.has_bankruptcy ? "Yes" : "No"}
                </p>

                <h3>Loan Details</h3>
                <p>
                  Requested Amount: $
                  {formData.loanDetails.requested_amount?.toLocaleString()}
                </p>
                <p>
                  Down Payment: $
                  {formData.loanDetails.down_payment?.toLocaleString()}
                </p>
                <p>Term: {formData.loanDetails.loan_term_months} months</p>

                <h3>Equipment Information</h3>
                <p>Type: {formData.equipmentInfo.equipment_type}</p>
                <p>Condition: {formData.equipmentInfo.equipment_condition}</p>
                <p>Purchase Type: {formData.equipmentInfo.purchase_type}</p>

                <h3>Contact Information</h3>
                <p>Name: {formData.contactInfo.contact_name}</p>
                <p>Email: {formData.contactInfo.email}</p>
                <p>State: {formData.contactInfo.state}</p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className={styles.formActions}>
            {currentStep > 0 && (
              <Button
                variant="secondary"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                Back
              </Button>
            )}
            {currentStep < steps.length - 1 && (
              <Button onClick={handleNext} disabled={isSubmitting}>
                Next
              </Button>
            )}
            {currentStep === steps.length - 1 && (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? <Loading size="small" /> : "Submit & Evaluate"}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
};
