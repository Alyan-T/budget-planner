import WhatIfAdvisor from "@/components/WhatIfAdvisor";

export default function AdvisorPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-black rounded-3xl p-8 flex flex-col justify-end min-h-[160px] text-white shadow-soft">
        <h1 className="text-[32px] font-bold tracking-tight uppercase">Financial Advisor</h1>
      </div>
      
      <WhatIfAdvisor />
    </div>
  );
}
