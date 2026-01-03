import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";

export const meta = () => [
  { title: "Resumind | Review " },
  { name: "description", content: "Detailed overview of your resume" },
];

const Resume = () => {
  const { auth, isLoading, fs, kv } = usePuterStore();
  const { id } = useParams();
  const [imageUrl, setImageUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated)
      navigate(`/auth?next=/resume/${id}`);
  }, [isLoading, auth.isAuthenticated]);

  useEffect(() => {
    const loadResume = async () => {
      const resumeStr = await kv.get(`resume:${id}`);
      if (!resumeStr) return;

      const data: Resume = JSON.parse(resumeStr);

      // Load PDF
      const resumeBlob = await fs.read(data.resumePath);
      if (resumeBlob)
        setResumeUrl(URL.createObjectURL(new Blob([resumeBlob], { type: "application/pdf" })));

      // Load image
      const imageBlob = await fs.read(data.imagePath);
      if (imageBlob) setImageUrl(URL.createObjectURL(imageBlob));

      // Ensure feedback object
      let parsedFeedback: Feedback = data.feedback;
      if (!parsedFeedback) {
        parsedFeedback = {
          overallScore: 0,
          ATS: { score: 0, tips: [] },
          toneAndStyle: { score: 0, tips: [] },
          content: { score: 0, tips: [] },
          structure: { score: 0, tips: [] },
          skills: { score: 0, tips: [] },
        };
      }

      setFeedback(parsedFeedback);
    };

    loadResume();
  }, [id, fs, kv]);

  return (
    <main className="!pt-0">
      <nav className="resume-nav">
        <Link to="/" className="back-button">
          <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5" />
          <span className="text-gray-800 text-sm font-semibold">
            Back to Homepage
          </span>
        </Link>
      </nav>

      <div className="flex flex-row w-full max-lg:flex-col-reverse">
        {/* Resume Image Section */}
        <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover h-[100vh] sticky top-0 flex items-center justify-center">
          {imageUrl && resumeUrl && (
            <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-w-xl:h-fit w-fit">
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={imageUrl}
                  className="w-full h-full object-contain rounded-2xl"
                  title="resume"
                  alt="resume"
                />
              </a>
            </div>
          )}
        </section>

        {/* Feedback Section */}
        <section className="feedback-section p-6 max-w-xl">
          <h2 className="text-4xl !text-black font-bold">Resume Review</h2>

          {feedback ? (
            <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
              <Summary feedback={feedback} />
              <ATS
                score={feedback.ATS.score ?? 0}
                suggestions={feedback.ATS.tips ?? []}
              />
              <Details feedback={feedback} />
            </div>
          ) : (
            <img
              src="/images/resume-scan-2.gif"
              className="w-full mt-6"
              alt="Loading resume scan"
            />
          )}
        </section>
      </div>
    </main>
  );
};

export default Resume;
