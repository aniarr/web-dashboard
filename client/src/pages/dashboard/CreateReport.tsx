import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Loader2,
  Sparkles,
  ArrowLeft,
  FileText
} from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { useCreateReport } from "@/hooks/use-reports";

export default function CreateReport() {

  const { user } = useAuth();

  const { mutateAsync } = useCreateReport();

  const [loading, setLoading] = useState(false);

  const [generated, setGenerated] = useState(false);

  const [output, setOutput] = useState("");

  const [form, setForm] = useState<any>({});



  const handleChange = (e: any) => {

    setForm({

      ...form,

      [e.target.name]: e.target.value

    });

  };



  const handleSubmit = async (e: any) => {

    e.preventDefault();

    if (!user) {
      alert("User not authenticated");
      return;
    }

    setLoading(true);

    try {

      const res = await mutateAsync({

        userId: user.id,

        title: form.title,

        details: JSON.stringify(form)

      });

      setOutput(res.content);

      setGenerated(true);

    }

    catch {

      alert("Report generation failed");

    }

    setLoading(false);

  };



  const reset = () => {

    setGenerated(false);

    setForm({});

    setOutput("");

  };



  return (

    <DashboardLayout>



      <div className="max-w-5xl mx-auto p-6">



        {/* FORM */}



        {!generated && (

          <Card>

            <CardContent className="p-6 space-y-4">

              <h1 className="text-3xl font-bold">

                Create Event Report

              </h1>



              <form

                onSubmit={handleSubmit}

                className="space-y-4"

              >



                <div>

                  <Label>Title of Activity</Label>

                  <Input

                    name="title"

                    onChange={handleChange}

                    required

                  />

                </div>



                <div>

                  <Label>Date</Label>

                  <Input

                    type="date"

                    name="date"

                    onChange={handleChange}

                  />

                </div>



                <div>

                  <Label>Department / Club</Label>

                  <Input

                    name="department"

                    onChange={handleChange}

                  />

                </div>



                <div className="grid grid-cols-2 gap-4">

                  <div>

                    <Label>Students</Label>

                    <Input

                      name="students"

                      type="number"

                      onChange={handleChange}

                    />

                  </div>



                  <div>

                    <Label>Faculties</Label>

                    <Input

                      name="faculties"

                      type="number"

                      onChange={handleChange}

                    />

                  </div>

                </div>



                <div>
                  <Label>Mode</Label>
                  <select
                    name="mode"
                    onChange={handleChange}
                    className="w-full border h-12 rounded-lg px-3"
                    aria-label="Mode"
                  >
                    <option>
                      Offline
                    </option>
                    <option>
                      Online
                    </option>
                    <option>
                      Hybrid
                    </option>
                  </select>
                </div>



                <div>

                  <Label>Report Keywords</Label>

                  <Textarea

                    name="report"

                    onChange={handleChange}

                  />

                </div>



                <div>

                  <Label>Feedback Keywords</Label>

                  <Textarea

                    name="feedback"

                    onChange={handleChange}

                  />

                </div>



                <div>

                  <Label>Programme Outcome</Label>

                  <Textarea

                    name="outcome"

                    onChange={handleChange}

                  />

                </div>



                <Button className="w-full h-12">

                  {loading ?

                    <>

                      <Loader2 className="animate-spin mr-2" />

                      Generating

                    </>

                    :

                    <>

                      <Sparkles className="mr-2" />

                      Generate Report

                    </>

                  }

                </Button>



              </form>

            </CardContent>

          </Card>

        )}



        {/* DOCUMENT */}



        {generated && (

          <div className="bg-gray-300 p-10">



            <div

              className="bg-white mx-auto shadow-xl"

              style={{

                width: "794px",

                minHeight: "1123px",

                padding: "60px"

              }}

            >



              {/* BACK BUTTON */}



              <Button

                onClick={reset}

                variant="outline"

                className="mb-6"

              >

                <ArrowLeft className="mr-2" />

                Back

              </Button>



              {/* HEADER */}



              <div className="text-center mb-6">

                <img
                  src="/logo.png"
                  className="h-20 mx-auto mb-2"
                  alt="College logo"
                />



                <h1 className="text-xl font-bold">

                  YOUR COLLEGE NAME

                </h1>



                <p>

                  Department of Computer Science

                </p>

              </div>



              <hr className="mb-6" />



              {/* TITLE */}



              <h2 className="text-center text-2xl font-bold underline mb-6">

                {form.title}

              </h2>



              {/* INTRO */}



              <p className="text-justify mb-4">

                The {form.department} organized the event titled

                <strong> "{form.title}" </strong>

                on {form.date} in {form.mode} mode.

              </p>



              {/* DETAILS */}



              <h3 className="font-bold mt-6">

                Event Details

              </h3>



              <ul className="list-disc ml-6">

                <li>

                  Department: {form.department}

                </li>



                <li>

                  Mode: {form.mode}

                </li>



                <li>

                  Students: {form.students}

                </li>



                <li>

                  Faculties: {form.faculties}

                </li>

              </ul>



              {/* REPORT */}



              <h3 className="font-bold mt-6">

                Report

              </h3>



              <p className="text-justify whitespace-pre-wrap">

                {output}

              </p>




              {/* FEEDBACK */}



              <h3 className="font-bold mt-6">

                Feedback

              </h3>



              <p>

                {form.feedback}

              </p>



              {/* OUTCOME */}



              <h3 className="font-bold mt-6">

                Programme Outcome

              </h3>



              <p>

                {form.outcome}

              </p>



              {/* SIGNATURE */}



              <div className="flex justify-between mt-20">

                <div>

                  Event Coordinator

                </div>



                <div>

                  Head of Department

                </div>

              </div>



            </div>



          </div>

        )}



      </div>



    </DashboardLayout>

  );

}