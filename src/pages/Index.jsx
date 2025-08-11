import React from "react";
import Navbar from "../components/Navbar";
import BookTable from "../components/BookTable";

export default function index() {
  return (
    <div className="container-fluid">
      <Navbar />
      <div>
        <BookTable />
      </div>
    </div>
  );
}
