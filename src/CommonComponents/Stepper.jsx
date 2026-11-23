import { Fragment } from "react";

function Stepper({ activeStep, steps }) {
  return (
    <div className="flex items-start justify-center w-full mb-4">
      {steps.map((step, index) => {
        const isActive = activeStep === step.id;
        const isCompleted = activeStep === "review" && step.id === "payment";

        return (
          <Fragment key={step.id}>
            <div
              aria-current={isActive ? "step" : undefined}
              className="flex flex-col items-center gap-2 w-24 sm:w-32 shrink-0"
            >
              <div
                className={`w-8 h-8 rounded-full relative z-10 border-2 flex items-center justify-center text-sm font-semibold transition-all duration-300
                        ${
                          isCompleted
                            ? "bg-gold border-gold text-bg-primary"
                            : isActive
                              ? "border-gold text-gold bg-bg-secondary"
                              : "border-border/40 text-cream-dim/40 bg-bg-secondary"
                        }`}
              >
                {isCompleted ? "✓" : step.number}
              </div>
              <span
                className={`text-[10px] sm:text-xs font-medium text-center leading-tight transition-all duration-300
                        ${isActive || isCompleted ? "text-cream" : "text-cream-dim/40"}`}
              >
                {step.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div className="relative flex-1 h-[2px] mt-4 -mx-8 sm:-mx-12 bg-border/20">
                <div
                  className={`absolute inset-y-0 left-0 bg-gold transition-all duration-300 ${
                    activeStep === "review" ? "w-full" : "w-0"
                  }`}
                />
              </div>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

export default Stepper;
