import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import Pagination from "./Common/CustomPagination";

let PageSize = 10;

const App = () => {
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loader, setLoader] = useState(true);
  const [isPending, setPending] = useState(false);
  const [id, setId] = useState(0);

  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * PageSize;
    const lastPageIndex = firstPageIndex + PageSize;
    return tableData.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, tableData]);

  const fetchData = async () => {
    setLoader(true);
    try {
      const response = await axios.get("http://localhost:3001/user_data");
      if (response.data) {
        setTableData(response.data);
        setLoader(false);
      }
    } catch (error) {
      setLoader(false);
      console.log("error", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClick = async (id, data) => {
     !data.isSecondStepCompleted && setPending(true);
      const payload = { ...data };
      if(!data.isDone){
        payload["isDone"] = true;
        setId(id)
      }else{
        payload["isSecondStepCompleted"] = true
      } 
      try {
        const response = await axios.put(
          `http://localhost:3001/user_data/${id}`,
          { ...payload }
        );
        if (response.data) {
          console.log("response.data", response.data);
          const cloneData = [...tableData];
          const index = cloneData.findIndex((data) => data.id === id);
          cloneData[index] = response.data;
          setTableData(cloneData);
          setPending(false);
        }
      } catch (error) {
        console.log("error", error);
        setPending(false);
      }
  };

  return (
    <div className="App">
      <div className="container">
        <h1 className="text-center">Table Data</h1>
        <div>
          <table className="table">
            <thead>
              <th>Sr.</th>
              <th>Name</th>
              <th>Email</th>
              <th>Profile</th>
              <th>Actions</th>
            </thead>
            {loader ? (
              <p>Loading...</p>
            ) : (
              <tbody>
                {currentTableData.length &&
                  currentTableData.map((data, key) => {
                    return (
                      <tr
                        style={{
                          background:
                            data.id === id && isPending ? "yellow" : "white",
                        }}
                        key={key}
                      >
                        <td>{data.id}</td>
                        <td>{data.name}</td>
                        <td>{data.email}</td>
                        <td>
                          <img src={data.image} alt={data.id} />
                        </td>
                        <td>
                          {!data.isSecondStepCompleted && <button
                            onClick={() => handleClick(data.id, data)}
                            className={`btn ${
                              data.isDone ? "btn-success" : "btn-primary"
                            }`}
                          >
                            {data.isDone ? "Done" : "Start"}
                          </button>}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            )}
          </table>
          <Pagination
            className="pagination-bar"
            currentPage={currentPage}
            totalCount={tableData.length}
            pageSize={PageSize}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
