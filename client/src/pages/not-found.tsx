import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, Home, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function NotFound() {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith('/admin');

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 items-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <h1 className="text-2xl font-bold text-foreground">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-muted-foreground">
            The page you are looking for does not exist or has been moved.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row justify-start pt-2">
          {isAdminRoute ? (
            <>
              <Button asChild variant="default">
                <Link to="/admin" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Admin Dashboard
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Main Site
                </Link>
              </Button>
            </>
          ) : (
            <Button asChild variant="default">
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
