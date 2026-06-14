
function MetricCard({ icon, title, value, description, subtitle, icon_2 }) {

    /*     const getTrendClass = () => {
            switch (trendType) {
                case "up":
                    return 'text-emerald-500 font-semibold text-xs'
                case "down":
                    return "text-red-500 font-semibold text-xs"
                default:
                    return "text-brown-light font-semibold text-xs"
            }
        } */

    return (
        <div className="relative overflow-hidden group p-6 rounded-2xl border border-border/70 bg-gradient-to-b from-bg-primary/20 to-bg-secondary/20 transition-all duration-300 hover:border-gold/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-gold/5 flex flex-col">
            <div className="flex items-center gap-2 w-full">
                <div className="w-14 h-14 rounded-full bg-gold/5 border border-gold/20 flex items-center justify-center text-gold shadow-[0_0_25px_rgba(201,168,76,0.25)] group-hover:bg-gold/10 group-hover:border-gold/30 transition-all duration-300">
                    {icon}
                </div>
                <div className="flex flex-col">
                    <span className="text-base uppercase font-playfair font-bold text-cream/90 tracking-normal">{title}</span>
                    <span className="text-xs text-cream-dim mt-0.5">{subtitle}</span>
                    <div className="w-full border-t border-gold/30 my-4" />
                </div>
            </div>
            <div className="flex flex-col gap-1 items-start justify-center">
                <span className="text-6xl font-bold font-playfair text-cream leading-none mb-3">{value}</span>
                <span className="text-xs text-cream-dim/40">{description}</span>
            </div>
            <div className="absolute bottom-4 right-4 text-8xl text-gold/15 group-hover:text-gold/20 group-hover:scale-110 group-hover:rotate-0 -rotate-12 pointer-events-none transition-all duration-500">
                {icon_2}
            </div>

            {/* <div className="relative">
                <span className="text-xs uppercase font-sans font-semibold text-cream-dim/60 tracking-wider">{title}</span>
                <span className="text-3xl font-bold font-playfair mt-1 text-gold">{value}</span>
                {(trend || description) && (
                    <div className="flex items-center gap-1.5 mt-2">
                        {trend && (
                            <span className={`text-xs font-bold ${getTrendClass()}`}>
                                {trend}
                            </span>
                        )}
                        {description && (
                            <span className="text-xs text-cream-dim/50">{description}</span>
                        )}
                    </div>
                )}
            </div>
            <div className="p-3 rounded-lg bg-gold/5 text-gold border border-gold/10 group-hover:bg-gold/15 group-hover:text-gold-light group-hover:scale-105 transition-all duration-300 flex items-center justify-center">
                {icon}
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-gold/5 blur-2xl group-hover:bg-gold/10 group-hover:scale-125 transition-all duration-500 pointer-events-none" /> */}

        </div>
    )
}

export { MetricCard };