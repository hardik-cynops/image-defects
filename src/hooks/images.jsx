import { ImageDefectService } from "@/utility/services";
import { useEffect, useState } from "react";

export const getImages = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await ImageDefectService.images();
        setData(result);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading };
};

export const getAuditData = (id) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await ImageDefectService.audit(id);
        setData(result);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchData();
    }
  }, [refresh, id]);

  const refreshData = () => {
    setRefresh(Math.random());
  };

  return { data, loading, refreshData };
};
