import Route from "@/app/components/Route";
import axios from "axios";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: { id: number };
}) {
  const { id } = params;

  

  

  // const routeData = await response;

  // console.log("routeData", routeData);

  return (
    <div>
        <Route id={id}/>
    </div>
  );
}
