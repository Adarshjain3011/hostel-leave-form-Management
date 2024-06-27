"use client"
import axios from "axios";
import { value } from "@repo/common/config";
export default function Home() {

  async function ftechData(){

    const response = await axios.get('http://localhost:4000/api/default');

    console.log("resposne ka data",response);

  }
  return (

    <div>

      <h1>{value}</h1>

      <h1>this is frontend </h1>

      <button onClick={ftechData}>fetch data</button>

    </div>
  );
}

