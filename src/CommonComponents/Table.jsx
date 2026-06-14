function Table({ columns, data = [], isLoading = false, emptyMessage = "No items found" }) {

    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[600px] text-left border-collapse">
                <thead>
                    <tr className="border-b border-border/10">
                        {columns.map((col) => (
                            <th key={col.key} className="pb-3 pr-3 text-xs font-sans font-semibold uppercase tracking-wider text-cream-dim/40 py-2">
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        // 1. Loading Skeleton Rows
                        Array.from({ length: 3 }).map((_, index) => (
                            <tr key={index} className="border-b border-border/5">
                                {columns.map((col) => (
                                    <td key={col.key} className="py-4">
                                        <div className="h-4 bg-cream-dim/10 rounded animate-pulse w-3/4" />
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : data.length === 0 ? (
                        // 2. Empty State
                        <tr>
                            <td colSpan={columns.length} className="py-8 text-center text-sm text-cream-dim/50">
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        // 3. Render Data Rows
                        data.map((row, rowIndex) => (
                            <tr key={row.id || rowIndex} className="border-b border-border/5 hover:bg-gold/5 transition-all duration-200">
                                {columns.map((col) => (
                                    <td key={col.key} className="py-4 pr-3 text-sm text-cream/90 align-middle">
                                        {col.render ? col.render(row, rowIndex) : row[col.key]

                                        }
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export { Table };
