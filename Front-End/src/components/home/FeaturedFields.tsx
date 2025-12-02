import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  Atom, 
  Microscope, 
  Cpu, 
  Heart, 
  Leaf,
  ArrowRight,
  Briefcase
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const fields = [
  { name: "Artificial Intelligence", icon: Brain, color: "text-purple-500", count: 8432 },
  { name: "Quantum Physics", icon: Atom, color: "text-blue-500", count: 5821 },
  { name: "Biotechnology", icon: Microscope, color: "text-green-500", count: 6234 },
  { name: "Computer Science", icon: Cpu, color: "text-cyan-500", count: 9127 },
  { name: "Medicine", icon: Heart, color: "text-red-500", count: 7653 },
  { name: "Environmental Science", icon: Leaf, color: "text-emerald-500", count: 4329 },
];

const FeaturedFields = () => {
  const navigate = useNavigate();

  return (
    <section className="container mx-auto px-4 py-16 bg-muted/30">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-secondary flex items-center justify-center">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Research Fields</h2>
            <p className="text-muted-foreground">Explore by discipline</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate("/fields")}>
          View All Fields
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {fields.map((field, index) => (
          <Card
            key={field.name}
            className="hover:shadow-card-hover transition-all duration-300 cursor-pointer group animate-scale-in"
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={() => navigate(`/field/${field.name.toLowerCase().replace(/\s+/g, "-")}`)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`${field.color} p-3 rounded-lg bg-muted`}>
                    <field.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {field.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {field.count.toLocaleString()} papers
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default FeaturedFields;
