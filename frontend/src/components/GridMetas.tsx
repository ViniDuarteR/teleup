import { type ComponentType, type SVGProps } from "react";
import { Phone, Clock, CheckCircle, Star } from "lucide-react";

interface Meta {
  id: number;
  titulo: string;
  atual: number;
  meta: number;
  icone: string;
  cor: string;
  formato?: string;
}

interface GridMetasProps {
  metas: Meta[];
}

const GridMetas = ({ metas }: GridMetasProps) => {
  const getIcon = (iconName: string) => {
    const iconMap: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
      phone: Phone,
      clock: Clock,
      "check-circle": CheckCircle,
      star: Star,
    };
    return iconMap[iconName] || Phone;
  };

  const getProgressClass = (cor: string) => {
    const classMap: Record<string, string> = {
      success: "progress-success",
      warning: "bg-warning",
      primary: "progress-primary",
      xp: "xp-bar",
    };
    return classMap[cor] || "progress-primary";
  };

  const formatValue = (value: number, formato?: string) => {
    switch (formato) {
      case "minutos": {
        const horas = Math.floor(value / 60);
        const mins = value % 60;
        return `${horas}h ${mins}m`;
      }
      case "porcentagem":
        return `${value}%`;
      default:
        return value.toString();
    }
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-5">
      {metas.map((meta) => {
        const Icon = getIcon(meta.icone);
        const percentage = meta.meta > 0 ? (meta.atual / meta.meta) * 100 : 0;
        const isCompleted = percentage >= 100;
        
        return (
          <div 
            key={meta.id} 
            className={`gaming-card p-4 lg:p-5 rounded-lg transition-all duration-300 hover:scale-105 ${
              isCompleted ? 'gaming-card-glow' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 lg:p-2.5 rounded-lg bg-${meta.cor}/20`}>
                <Icon className={`w-5 h-5 lg:w-6 lg:h-6 text-${meta.cor}`} />
              </div>
              {isCompleted && (
                <div className="text-success animate-pulse">
                  <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                </div>
              )}
            </div>
            
            <h3 className="font-semibold text-sm lg:text-base text-foreground mb-2">{meta.titulo}</h3>
            
            <div className="space-y-2 lg:space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xl lg:text-2xl font-bold text-foreground">
                  {formatValue(meta.atual, meta.formato)}
                </span>
                <span className="text-xs lg:text-sm text-muted-foreground">
                  / {formatValue(meta.meta, meta.formato)}
                </span>
              </div>
              
              <div className="space-y-1.5 lg:space-y-2">
                <div className="h-1.5 lg:h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getProgressClass(meta.cor)} transition-all duration-500`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] lg:text-xs text-muted-foreground">
                  <span>{isNaN(percentage) ? '0' : percentage.toFixed(0)}% completo</span>
                  <span className={isCompleted ? 'text-success font-semibold' : ''}>
                    {isCompleted ? 'META ATINGIDA!' : `Faltam ${Math.max(0, meta.meta - meta.atual)}`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GridMetas;
