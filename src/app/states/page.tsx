"use client";

import {
  createTableStates,
  deleteTableResources,
  getTableStates,
} from "../lib/states";


export default function PageState() {
  async function handleClick() {
    await createTableStates();
  }

  async function handleDelete() {
    await deleteTableResources();
  }

  async function handleGetStates() {
    await getTableStates();
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1>This page will soon show the currently implemented table states</h1>
      <button onClick={handleClick}>Create Table States</button>
      <h1>---------------------------------</h1>
      <button onClick={handleDelete}>Delete resources</button>
      <h1>---------------------------------</h1>
      <button onClick={handleGetStates}>Get Table States</button>
    </div>
  );
}
