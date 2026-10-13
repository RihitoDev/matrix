import { CheckCircle2, Clock } from "lucide-react";


interface Requirement {
  id: string;
  name: string;
  status: "cumple" | "pendiente";
}

interface MissingRequirementsProps {
  requirements: Requirement[];
}

export function MissingRequirements({ requirements }: MissingRequirementsProps) {
  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg bg-white">
      <h3 className="text-lg font-semibold text-gray-900">
        Habilidades y requisitos faltantes
      </h3>
      
      <ul className="space-y-3">
        {requirements.map((req) => (
          <li key={req.id} className="flex items-center gap-3">
          
            {req.status === "cumple" ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <Clock className="w-5 h-5 text-amber-500" />
            )}
            
            <span className={`text-sm ${req.status === "cumple" ? "text-gray-700" : "text-gray-900 font-medium"}`}>
              {req.name}
            </span>
            
           
            <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
              req.status === "cumple" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
            }`}>
              {req.status === "cumple" ? "Cumple" : "Pendiente"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}