import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@components/Layout";
import { Card } from "@components/Card";
import { Button } from "@components/Button";
import { Input } from "@components/Input";
import { ErrorMessage } from "@components/ErrorMessage";
import { Loading } from "@components/Loading";
import { useUploadPDF } from "@hooks/useLenders";
import styles from "./LenderCreatePage.module.css";

export const LenderCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const uploadPDFMutation = useUploadPDF();

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [lenderName, setLenderName] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const handlePDFSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pdfFile || !lenderName) {
      return;
    }

    try {
      const result = await uploadPDFMutation.mutateAsync({
        file: pdfFile,
        lenderName,
      });
      navigate(`/lenders/${result.lender_id}`);
    } catch (error) {
      console.error("Failed to upload PDF:", error);
    }
  };

  const validateAndSetFile = (file: File) => {
    if (file.type === 'application/pdf') {
      setPdfFile(file);
    } else {
      alert('Please upload a PDF file only');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setPdfFile(null);
  };

  const isLoading = uploadPDFMutation.isPending;
  const error = uploadPDFMutation.error;

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Add New Lender</h1>
          <Button variant="secondary" onClick={() => navigate("/lenders")}>
            Back to Lenders
          </Button>
        </div>

        {error && (
          <ErrorMessage message={error.message || "Failed to upload PDF"} />
        )}

        <Card>
          <form onSubmit={handlePDFSubmit} className={styles.form}>
            <div className={styles.section}>
              <h2>Upload PDF Document</h2>
              <p className={styles.description}>
                Upload a PDF document containing lender criteria. Our AI will
                extract and structure the information automatically.
              </p>

              <Input
                label="Lender Name"
                value={lenderName}
                onChange={(e) => setLenderName(e.target.value)}
                required
                placeholder="Enter lender name (e.g., Advantage+ Financing)"
              />

              <div className={styles.uploadSection}>
                <label className={styles.uploadLabel}>
                  Upload Lender Criteria PDF <span className={styles.required}>*</span>
                </label>

                {!pdfFile ? (
                  <div
                    className={`${styles.dropZone} ${isDragging ? styles.dropZoneDragging : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      id="pdf-upload"
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileChange}
                      className={styles.fileInputHidden}
                    />
                    <div className={styles.dropZoneContent}>
                      <div className={styles.uploadIcon}>📄</div>
                      <h3 className={styles.dropZoneTitle}>
                        Drag & drop your PDF here
                      </h3>
                      <p className={styles.dropZoneOr}>or</p>
                      <label htmlFor="pdf-upload" className={styles.browseButton}>
                        Browse Files
                      </label>
                      <p className={styles.dropZoneHint}>
                        Accepted format: PDF (Max 50MB)
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className={styles.filePreview}>
                    <div className={styles.filePreviewIcon}>📄</div>
                    <div className={styles.filePreviewInfo}>
                      <h4 className={styles.filePreviewName}>{pdfFile.name}</h4>
                      <p className={styles.filePreviewSize}>
                        {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className={styles.removeButton}
                      aria-label="Remove file"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.actions}>
              <Button
                type="submit"
                disabled={isLoading || !pdfFile || !lenderName}
              >
                {isLoading ? <Loading size="small" /> : "Upload & Process PDF"}
              </Button>
            </div>

            {isLoading && (
              <div className={styles.processingMessage}>
                <Loading />
                <p>Processing PDF... This may take up to 2 minutes.</p>
              </div>
            )}
          </form>
        </Card>
      </div>
    </Layout>
  );
};
