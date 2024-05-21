"use client";
import { BrowserUtility } from "@/utility/browser-utility";
import { CommonConstant } from "@/utility/constant";
import { UserService } from "@/utility/services";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert, Spinner } from "react-bootstrap";

export default function Login() {
  const [processing, setProcessing] = useState("");
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const uid = searchParams.get("Token");
  const auditId = searchParams.get("AuditId");

  useEffect(() => {
    if (uid) {
      login();
    } else {
      setError("No token found");
    }
  }, [uid]);

  const login = async () => {
    try {
      setProcessing("Processing...");
      const result = await UserService.login(uid);
      BrowserUtility.save(CommonConstant.token, uid);
      BrowserUtility.saveObj(CommonConstant.user, result);
      router.push(`/?auditId=${auditId}`);
    } catch (error) {
      setError("Something went wrong");
      console.log(error);
    } finally {
      setProcessing("");
    }
  };

  return (
    <div className="container">
      {processing && (
        <Spinner animation="border" role="status">
          <span className="visually-hidden">{processing}</span>
        </Spinner>
      )}
      {error && <Alert variant="danger">{error}</Alert>}
    </div>
  );
}
