"use client";
import React, { useEffect, useState } from "react";
import { getAuditData, getImages } from "@/hooks/images";
import { BrowserUtility } from "@/utility/browser-utility";
import { CommonConstant } from "@/utility/constant";
import { ImageDefectService } from "@/utility/services";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Form, ListGroup, Spinner } from "react-bootstrap";

const styles = {
  points: {
    position: "absolute",
    background: "red",
    height: "5px",
    width: "5px",
    borderRadius: "5px",
  },
};
export const dynamic = "force-dynamic";

/* eslint-disable @next/next/no-img-element */
export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auditId = searchParams.get("auditId");

  if (
    typeof window !== "undefined" &&
    !BrowserUtility.get(CommonConstant.token)
  ) {
    router.replace("/login");
    return;
  }

  const { data: images, loading } = getImages();
  const {
    data: auditData,
    loading: auditLoading,
    refreshData,
  } = getAuditData(auditId);
  const [points, setPoints] = useState([]);
  const [currentImage, setCurrentImage] = useState(null);
  const [processing, setProcessing] = useState("");
  const [comment, setComment] = useState("");
  const [ncId, setNCId] = useState("");

  useEffect(() => {
    if (images.length > 0 && !currentImage?.imageId) {
      auditClick(images[0]);
    }
  }, [images, currentImage]);

  const auditClick = (image) => {
    setCurrentImage({ ...image });
    reset();
  };

  const onClickSvg = (evt) => {
    try {
      const e = evt.currentTarget;
      const dim = e.getBoundingClientRect();
      const x = evt.clientX - dim.left;
      const y = evt.clientY - dim.top;
      if (!points.some((item) => item.x === x && item.y === y)) {
        setPoints([...points, { x, y }]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const reset = () => {
    setComment("");
    setNCId("");
    setPoints([]);
  };

  const onRemove = (item) => {
    setPoints(points.filter((x) => x.x !== item.x && x.y !== item.y));
  };

  const submitDefect = async () => {
    try {
      setProcessing("Processing...");
      const temp = {
        AuditId: auditId,
        NCId: ncId,
        ImageId: currentImage.imageId,
        Comment: comment,
        ImageString: JSON.stringify(points),
      };

      await ImageDefectService.save(temp);
      reset();
      refreshData();
    } catch (error) {
      setError("Something went wrong");
      console.log(error);
    } finally {
      setProcessing("");
    }
  };

  const onNCChange = (value) => {
    setNCId(value);
    if (value) {
      const temp = auditData.imageData.find((x) => x.ncId === +value);
      if (temp) {
        setPoints(JSON.parse(temp.imageString));
        setComment(temp.comment);
      }
    }
  };

  return (
    <div className="container">
      {(loading || auditLoading) && (
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      )}
      <div className="row pt-2">
        <div className="col-4">
          <ListGroup style={{ overflow: "auto", maxHeight: "80vh" }}>
            {(images || []).map((item) => (
              <ListGroup.Item
                key={item.imageId}
                className="btn btn-primary"
                onClick={() => auditClick(item)}
                active={item.imageId === currentImage?.imageId}
              >
                {item.department}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
        {currentImage?.imageId && (
          <div className="col">
            <div>
              <Form.Group className="mb-3">
                <Form.Label>Select NC</Form.Label>
                <Form.Select
                  aria-label="Select NC"
                  value={ncId}
                  onChange={(e) => onNCChange(e.target.value)}
                >
                  <option>Select</option>
                  {(auditData?.auditNCData || []).map((item) => (
                    <option value={item.unique_id} key={item.unique_id}>
                      {item.full_description}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
            {ncId && (
              <>
                <div style={{ position: "relative" }}>
                  <img src={"/image.svg"} onClick={onClickSvg} />
                  {points.map((item) => (
                    <span
                      onClick={() => onRemove(item)}
                      key={`${item.x}-${item.y}`}
                      style={{
                        ...styles.points,
                        left: item.x,
                        top: item.y,
                      }}
                    />
                  ))}
                </div>
                <div>
                  <b>Total Defects:</b>
                  <span>{points.length}</span>
                </div>
                <div>
                  <Form.Group className="mb-3">
                    <Form.Label>Comment</Form.Label>
                    <Form.Control
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      as="textarea"
                      rows={3}
                    />
                  </Form.Group>
                </div>
                <div>
                  <Button onClick={submitDefect}>
                    {processing && (
                      <Spinner
                        as="span"
                        animation="grow"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />
                    )}
                    Submit
                  </Button>{" "}
                  <Button variant="light" onClick={reset}>
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
