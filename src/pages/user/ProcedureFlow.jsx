import { procedureSteps } from '../../data/mockData'

const ProcedureFlow = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="glass-card rounded-2xl border px-6 py-6">
        <h3 className="text-xl font-semibold text-ink-900">Procedure Flow</h3>
        <p className="mt-2 text-sm text-ink-600">
          Follow the NGJA export documentation lifecycle.
        </p>
      </div>
      <div className="space-y-6">
        {procedureSteps.map((step, index) => (
          <div key={step.title} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-azure-100 text-sm font-semibold text-azure-700">
                {index + 1}
              </div>
              {index < procedureSteps.length - 1 ? (
                <div className="mt-2 h-full w-px bg-cloud-200" />
              ) : null}
            </div>
            <div className="glass-card w-full rounded-2xl border px-6 py-5">
              <h4 className="text-lg font-semibold text-ink-900">
                {step.title}
              </h4>
              <p className="mt-2 text-sm text-ink-600">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProcedureFlow
