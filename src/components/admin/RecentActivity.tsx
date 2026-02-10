import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminLog } from "@/types/admin";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ActivityProps {
    logs: AdminLog[];
    loading: boolean;
}

export function RecentActivity({ logs, loading }: ActivityProps) {
    if (loading) return <Skeleton className="h-[350px] w-full rounded-xl" />;

    return (
        <Card className="bg-background-alt border-white/10 col-span-3">
            <CardHeader>
                <CardTitle className="text-text-primary">Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-8 pr-4 h-[300px] overflow-y-auto">
                    {logs.length === 0 ? (
                        <p className="text-text-muted text-sm text-center py-4">No hay actividad registrada.</p>
                    ) : (
                        logs.map((log) => (
                            <div key={log.id} className="flex items-center">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none text-text-primary">
                                        {log.admin_email}
                                    </p>
                                    <p className="text-xs text-text-muted">
                                        {getActionText(log)}
                                    </p>
                                </div>
                                <div className="ml-auto font-medium text-xs text-text-muted">
                                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: es })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function getActionText(log: AdminLog): string {
    switch (log.action) {
        case 'create': return `Creó un nuevo ${log.entity}`;
        case 'update': return `Actualizó ${log.entity}`;
        case 'delete': return `Eliminó ${log.entity}`;
        case 'login': return `Inició sesión`;
        default: return `${log.action} en ${log.entity}`;
    }
}
