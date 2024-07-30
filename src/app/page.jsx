"use client";
import React, { useMemo, useState } from "react";
import { getAuditData } from "@/hooks/images";
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

  const [images, setImages] = useState([]);

  const [purchaseOrders, setPurchaseOrders] = useState([]);
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
  const [selectedPO, setSelectedPO] = useState([]);

  const currentNc = useMemo(() => {
    if (ncId && auditData) {
      const tempData = auditData.auditNCData.find((x) => x.unique_id === +ncId);
      return tempData;
    }
    return null;
  }, [auditData, ncId]);

  const poPoints = useMemo(() => {
    if (currentImage?.imageId) {
      const temp = auditData.imageData.find(
        (x) => x.ncId === +ncId && x.imageId === +currentImage.imageId,
      );
      if (temp) {
        return [
          ...temp.supplierImageData
            .filter(
              (x) =>
                x.imageId === +currentImage.imageId &&
                selectedPO.includes(`${x.audit_type}:${x.purchase_order_nbr}`),
            )
            .map((x) => JSON.parse(x.imageString)),
        ];
      }
    }
    return [];
  }, [currentImage, selectedPO]);

  const auditClick = (imageId) => {
    reset();
    const image = images.find((x) => x.imageId === +imageId);
    setCurrentImage({ ...image });
    const temp = auditData.imageData.find(
      (x) => x.ncId === +ncId && x.imageId === +imageId,
    );

    if (temp) {
      setPurchaseOrders(
        temp.supplierImageData.filter((x) => x.imageId === +imageId),
      );
      setPoints(JSON.parse(temp.imageString));
      setComment(temp.comment);
    }
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
    setCurrentImage(null);
    setPoints([]);
    setSelectedPO([]);
    setPurchaseOrders([]);
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
      setNCId(null);
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
      reset();
      const tempData = auditData.auditNCData.find(
        (x) => x.unique_id === +value,
      );
      setImages(tempData.ncImages);
    }
  };

  const toggleSelectPO = (item) => {
    if (selectedPO.includes(item)) {
      setSelectedPO(selectedPO.filter((x) => x !== item));
    } else {
      setSelectedPO([...selectedPO, item]);
    }
  };

  return (
    <div className="container">
      {auditLoading && (
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      )}
      <div
        className={`row pt-2 vh-100 ${
          !currentImage?.imageId && "align-items-center"
        }`}
      >
        <div
          className={`col-12 ${
            currentImage?.imageId && "d-flex justify-content-center gap-20"
          }`}
        >
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
          {ncId && (
            <Form.Group className="mb-3">
              <Form.Label>Select Image</Form.Label>
              <Form.Select
                aria-label="Select Image"
                value={currentImage?.imageId}
                onChange={(e) => auditClick(e.target.value)}
              >
                <option>Select</option>
                {(images || []).map((item) => (
                  <option value={item.imageId} key={item.imageId}>
                    {item.department}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}
        </div>

        {currentImage?.imageId && (
          <div className="image-container">
            <div style={{ position: "relative" }}>
              <img src={currentImage?.imagePath} onClick={onClickSvg} />
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
              {poPoints.map((item) => (
                <span
                  key={`${item.x}-${item.y}`}
                  style={{
                    ...styles.points,
                    backgroundColor: "green",
                    left: item.x,
                    top: item.y,
                  }}
                />
              ))}
            </div>
            <div>
              <div className="mb-4">
                <ListGroup>
                  <ListGroup.Item>
                    <b>Purchase Orders</b>
                  </ListGroup.Item>
                  {purchaseOrders.map((item) => (
                    <ListGroup.Item
                      key={`${item.audit_type}:${item.purchase_order_nbr}`}
                    >
                      <Form.Check // prettier-ignore
                        type={"checkbox"}
                        id={`${item.audit_type}:${item.purchase_order_nbr}`}
                        label={`${item.audit_type}: ${item.purchase_order_nbr}`}
                        value={selectedPO.includes(
                          `${item.audit_type}:${item.purchase_order_nbr}`,
                        )}
                        onChange={() =>
                          toggleSelectPO(
                            `${item.audit_type}:${item.purchase_order_nbr}`,
                          )
                        }
                      />
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
              <div className="mb-4">
                <ListGroup>
                  <ListGroup.Item>
                    N/C Type : {currentNc?.defect_type}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    Severity Level :{" "}
                    {currentNc?.major_minor ? "Major" : "Minor"}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    No of Rejected : {currentNc?.rejected_qty}
                  </ListGroup.Item>
                </ListGroup>
              </div>
              <div className="mb-2">
                <b>Total Defects: </b>
                <span>{points.length}</span>
              </div>
              <div>
                <Form.Group className="mb-3">
                  <Form.Label>Comment</Form.Label>
                  <Form.Control
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    as="textarea"
                    rows={5}
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
