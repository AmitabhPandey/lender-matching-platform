import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "@components/Layout";
import { Card } from "@components/Card";
import { Button } from "@components/Button";
import { Input } from "@components/Input";
import { ErrorMessage } from "@components/ErrorMessage";
import { Loading } from "@components/Loading";
import { useLender, useUpdateLender } from "@hooks/useLenders";
import { useCriteria, useUpdateCriteria, useDeleteCriteria, useCreateCriteria } from "@hooks/useCriteria";
import type { LenderUpdateDTO } from "@/types/lender.types";
import type { Criteria, CriteriaUpdateDTO, CriteriaType } from "@/types/criteria.types";
import styles from "./LenderEditPage.module.css";

export const LenderEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: lender, isLoading: isLoadingLender, error: errorLender } = useLender(id!);
  const { data: criteria = [], isLoading: isLoadingCriteria } = useCriteria(id!);
  const updateLenderMutation = useUpdateLender();
  const updateCriteriaMutation = useUpdateCriteria();
  const deleteCriteriaMutation = useDeleteCriteria();
  const createCriteriaMutation = useCreateCriteria();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    representative: "",
    email: "",
    phone: "",
    isBroker: false,
    supportsStartups: false,
    decisionTurnaroundDays: "",
  });

  // Criteria editing state
  const [editedCriteria, setEditedCriteria] = useState<Record<string, any>>({});
  const [deletedCriteriaIds, setDeletedCriteriaIds] = useState<Set<string>>(new Set());
  const [showNewCriteriaForm, setShowNewCriteriaForm] = useState(false);
  const [newCriteria, setNewCriteria] = useState<{
    criteria_key: string;
    display_name: string;
    description: string;
    category: string;
    criteria_type: CriteriaType;
    criteria_value: string | boolean;
    is_required: boolean;
  }>({
    criteria_key: "",
    display_name: "",
    description: "",
    category: "",
    criteria_type: "string",
    criteria_value: "",
    is_required: false,
  });

  // Pre-populate form when lender data is loaded
  useEffect(() => {
    if (lender) {
      setFormData({
        name: lender.name || "",
        representative: lender.contact?.representative || "",
        email: lender.contact?.email || "",
        phone: lender.contact?.phone || "",
        isBroker: lender.business_model?.is_broker || false,
        supportsStartups: lender.business_model?.supports_startups || false,
        decisionTurnaroundDays: 
          lender.business_model?.decision_turnaround_days?.toString() || "",
      });
    }
  }, [lender]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return;
    }

    try {
      // 1. Update lender basic information
      const updateData: LenderUpdateDTO = {
        name: formData.name.trim(),
        contact: {
          representative: formData.representative.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
        },
        business_model: {
          is_broker: formData.isBroker,
          supports_startups: formData.supportsStartups,
          decision_turnaround_days: formData.decisionTurnaroundDays 
            ? parseInt(formData.decisionTurnaroundDays, 10) 
            : undefined,
        },
      };

      await updateLenderMutation.mutateAsync({
        id: id!,
        data: updateData,
      });

      // 2. Delete criteria marked for deletion
      for (const criteriaId of deletedCriteriaIds) {
        await deleteCriteriaMutation.mutateAsync(criteriaId);
      }

      // 3. Update edited criteria
      for (const [criteriaId, updates] of Object.entries(editedCriteria)) {
        if (!deletedCriteriaIds.has(criteriaId)) {
          await updateCriteriaMutation.mutateAsync({
            id: criteriaId,
            data: updates as CriteriaUpdateDTO,
          });
        }
      }

      // 4. Create new criteria if form was filled out
      if (showNewCriteriaForm && newCriteria.criteria_key && newCriteria.display_name) {
        const criteriaValue = 
          newCriteria.criteria_type === 'boolean' 
            ? newCriteria.criteria_value === 'true' || newCriteria.criteria_value === true
            : newCriteria.criteria_type === 'number'
            ? parseFloat(newCriteria.criteria_value as string) || 0
            : newCriteria.criteria_type === 'array'
            ? (newCriteria.criteria_value as string).split(',').map(v => v.trim())
            : newCriteria.criteria_value;

        await createCriteriaMutation.mutateAsync({
          lender_id: id!,
          criteria_key: newCriteria.criteria_key,
          display_name: newCriteria.display_name,
          description: newCriteria.description,
          category: newCriteria.category,
          criteria_type: newCriteria.criteria_type,
          criteria_value: criteriaValue,
          is_required: newCriteria.is_required,
        });
      }

      // Navigate back to lender detail page on success
      navigate(`/lenders/${id}`);
    } catch (error) {
      console.error("Failed to update lender and criteria:", error);
    }
  };

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCriteriaChange = (criteriaId: string, field: string, value: any) => {
    setEditedCriteria((prev) => ({
      ...prev,
      [criteriaId]: {
        ...prev[criteriaId],
        [field]: value,
      },
    }));
  };

  const handleDeleteCriteria = (criteriaId: string) => {
    setDeletedCriteriaIds((prev) => new Set(prev).add(criteriaId));
  };

  const handleRestoreCriteria = (criteriaId: string) => {
    setDeletedCriteriaIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(criteriaId);
      return newSet;
    });
  };

  const getCriteriaValue = (criterion: Criteria, field: string) => {
    if (editedCriteria[criterion._id]?.[field] !== undefined) {
      return editedCriteria[criterion._id][field];
    }
    return criterion[field as keyof Criteria];
  };

  const handleNewCriteriaChange = (field: string, value: any) => {
    setNewCriteria((prev) => ({ ...prev, [field]: value }));
  };

  // Loading state
  if (isLoadingLender || isLoadingCriteria) {
    return (
      <Layout>
        <div className={styles.container}>
          <Loading />
        </div>
      </Layout>
    );
  }

  // Error state
  if (errorLender || !lender) {
    return (
      <Layout>
        <div className={styles.container}>
          <ErrorMessage
            message="Failed to load lender details. The lender may not exist."
            onRetry={() => window.location.reload()}
          />
          <Button variant="secondary" onClick={() => navigate("/lenders")}>
            Back to Lenders
          </Button>
        </div>
      </Layout>
    );
  }

  const isLoading = updateLenderMutation.isPending || updateCriteriaMutation.isPending || deleteCriteriaMutation.isPending || createCriteriaMutation.isPending;
  const error = updateLenderMutation.error || updateCriteriaMutation.error || deleteCriteriaMutation.error;

  // Group criteria by category
  const groupedCriteria = criteria.reduce((acc, criterion) => {
    const category = criterion.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(criterion);
    return acc;
  }, {} as Record<string, Criteria[]>);

  // Get unique categories for the dropdown
  const existingCategories = Array.from(
    new Set(criteria.map(c => c.category || 'Other'))
  ).sort();

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Edit Lender</h1>
          <Button 
            variant="secondary" 
            onClick={() => navigate(`/lenders/${id}`)}
          >
            Cancel
          </Button>
        </div>

        {error && (
          <ErrorMessage message={error.message || "Failed to update lender"} />
        )}

        <Card>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.section}>
              <h2>Basic Information</h2>
              <Input
                label="Lender Name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                placeholder="Enter lender name"
              />
            </div>

            <div className={styles.section}>
              <h2>Contact Information</h2>
              <Input
                label="Representative"
                value={formData.representative}
                onChange={(e) =>
                  handleInputChange("representative", e.target.value)
                }
                placeholder="Enter representative name"
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="representative@lender.com"
              />
              <Input
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className={styles.section}>
              <h2>Business Model</h2>
              
              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.isBroker}
                    onChange={(e) =>
                      handleInputChange("isBroker", e.target.checked)
                    }
                    className={styles.checkbox}
                  />
                  <span>Is Broker</span>
                </label>
              </div>

              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.supportsStartups}
                    onChange={(e) =>
                      handleInputChange("supportsStartups", e.target.checked)
                    }
                    className={styles.checkbox}
                  />
                  <span>Supports Startups</span>
                </label>
              </div>

              <Input
                label="Decision Turnaround (days)"
                type="number"
                min="0"
                value={formData.decisionTurnaroundDays}
                onChange={(e) =>
                  handleInputChange("decisionTurnaroundDays", e.target.value)
                }
                placeholder="e.g., 5"
              />
            </div>

            {/* Criteria Section */}
            <div className={styles.section}>
              <div className={styles.sectionHeaderWithAction}>
                <h2>Lending Criteria</h2>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowNewCriteriaForm(!showNewCriteriaForm)}
                >
                  {showNewCriteriaForm ? "Cancel" : "+ Add Criteria"}
                </Button>
              </div>
              <p className={styles.sectionDescription}>
                Edit the criteria values for this lender. Changes will be saved when you update the lender.
              </p>

              {/* New Criteria Form */}
              {showNewCriteriaForm && (
                <div className={styles.newCriteriaForm}>
                  <h3 className={styles.formTitle}>Add New Criteria</h3>
                  
                  <Input
                    label="Criteria Key"
                    value={newCriteria.criteria_key}
                    onChange={(e) => handleNewCriteriaChange("criteria_key", e.target.value)}
                    placeholder="e.g., min_credit_score"
                    required
                  />

                  <Input
                    label="Display Name"
                    value={newCriteria.display_name}
                    onChange={(e) => handleNewCriteriaChange("display_name", e.target.value)}
                    placeholder="e.g., Minimum Credit Score"
                    required
                  />

                  <Input
                    label="Description"
                    value={newCriteria.description}
                    onChange={(e) => handleNewCriteriaChange("description", e.target.value)}
                    placeholder="Optional description"
                  />

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>
                      Category
                      {existingCategories.length > 0 && (
                        <span className={styles.hint}> (Select existing or type new)</span>
                      )}
                    </label>
                    <input
                      type="text"
                      list="categories"
                      value={newCriteria.category}
                      onChange={(e) => handleNewCriteriaChange("category", e.target.value)}
                      placeholder="Select existing or type new category"
                      className={styles.select}
                    />
                    {existingCategories.length > 0 && (
                      <datalist id="categories">
                        {existingCategories.map((cat) => (
                          <option key={cat} value={cat} />
                        ))}
                      </datalist>
                    )}
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Criteria Type</label>
                    <select
                      value={newCriteria.criteria_type}
                      onChange={(e) => handleNewCriteriaChange("criteria_type", e.target.value)}
                      className={styles.select}
                    >
                      <option value="string">String</option>
                      <option value="number">Number</option>
                      <option value="boolean">Boolean</option>
                      <option value="array">Array</option>
                    </select>
                  </div>

                  {newCriteria.criteria_type === 'boolean' ? (
                    <div className={styles.checkboxGroup}>
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={newCriteria.criteria_value === 'true' || newCriteria.criteria_value === true}
                          onChange={(e) =>
                            handleNewCriteriaChange("criteria_value", e.target.checked ? 'true' : 'false')
                          }
                          className={styles.checkbox}
                        />
                        <span>Value</span>
                      </label>
                    </div>
                  ) : newCriteria.criteria_type === 'number' ? (
                    <Input
                      label="Value"
                      type="number"
                      value={newCriteria.criteria_value as string}
                      onChange={(e) => handleNewCriteriaChange("criteria_value", e.target.value)}
                      placeholder="Enter number value"
                    />
                  ) : newCriteria.criteria_type === 'array' ? (
                    <Input
                      label="Value (comma-separated)"
                      value={newCriteria.criteria_value as string}
                      onChange={(e) => handleNewCriteriaChange("criteria_value", e.target.value)}
                      placeholder="value1, value2, value3"
                    />
                  ) : (
                    <Input
                      label="Value"
                      value={newCriteria.criteria_value as string}
                      onChange={(e) => handleNewCriteriaChange("criteria_value", e.target.value)}
                      placeholder="Enter value"
                    />
                  )}

                  <div className={styles.checkboxGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={newCriteria.is_required}
                        onChange={(e) =>
                          handleNewCriteriaChange("is_required", e.target.checked)
                        }
                        className={styles.checkbox}
                      />
                      <span>Required</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Existing Criteria */}
              {criteria.length > 0 && Object.entries(groupedCriteria).map(([category, items]) => (
                <div key={category} className={styles.criteriaCategory}>
                  <h3 className={styles.categoryTitle}>{category}</h3>
                  
                  {items.map((criterion) => {
                    const isDeleted = deletedCriteriaIds.has(criterion._id);
                    
                    return (
                      <div 
                        key={criterion._id} 
                        className={`${styles.criteriaItem} ${isDeleted ? styles.criteriaDeleted : ''}`}
                      >
                        <div className={styles.criteriaHeader}>
                          <div className={styles.criteriaInfo}>
                            <label className={styles.criteriaLabel}>
                              {getCriteriaValue(criterion, 'display_name')}
                              {criterion.is_required && (
                                <span className={styles.requiredBadge}>Required</span>
                              )}
                            </label>
                            {criterion.description && (
                              <p className={styles.criteriaDescription}>
                                {criterion.description}
                              </p>
                            )}
                          </div>
                          <div className={styles.criteriaActions}>
                            {isDeleted ? (
                              <Button
                                type="button"
                                variant="secondary"
                                onClick={() => handleRestoreCriteria(criterion._id)}
                              >
                                Restore
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                variant="secondary"
                                onClick={() => handleDeleteCriteria(criterion._id)}
                              >
                                Delete
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {!isDeleted && (
                          <div className={styles.criteriaInputs}>
                            {criterion.criteria_type === 'boolean' ? (
                              <div className={styles.checkboxGroup}>
                                <label className={styles.checkboxLabel}>
                                  <input
                                    type="checkbox"
                                    checked={getCriteriaValue(criterion, 'criteria_value') as boolean}
                                    onChange={(e) =>
                                      handleCriteriaChange(
                                        criterion._id,
                                        'criteria_value',
                                        e.target.checked
                                      )
                                    }
                                    className={styles.checkbox}
                                  />
                                  <span>Enabled</span>
                                </label>
                              </div>
                            ) : criterion.criteria_type === 'number' ? (
                              <Input
                                label="Value"
                                type="number"
                                value={getCriteriaValue(criterion, 'criteria_value')?.toString() || ''}
                                onChange={(e) =>
                                  handleCriteriaChange(
                                    criterion._id,
                                    'criteria_value',
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                              />
                            ) : criterion.criteria_type === 'array' ? (
                              <Input
                                label="Value (comma-separated)"
                                value={
                                  Array.isArray(getCriteriaValue(criterion, 'criteria_value'))
                                    ? (getCriteriaValue(criterion, 'criteria_value') as any[]).join(', ')
                                    : getCriteriaValue(criterion, 'criteria_value')?.toString() || ''
                                }
                                onChange={(e) =>
                                  handleCriteriaChange(
                                    criterion._id,
                                    'criteria_value',
                                    e.target.value.split(',').map(v => v.trim())
                                  )
                                }
                              />
                            ) : (
                              <Input
                                label="Value"
                                value={getCriteriaValue(criterion, 'criteria_value')?.toString() || ''}
                                onChange={(e) =>
                                  handleCriteriaChange(
                                    criterion._id,
                                    'criteria_value',
                                    e.target.value
                                  )
                                }
                              />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className={styles.actions}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(`/lenders/${id}`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !formData.name.trim()}>
                {isLoading ? <Loading size="small" /> : "Update Lender"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
};
