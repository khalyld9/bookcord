import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { BookDetail } from "@/components/books/book-detail";
import { Button } from "@/components/ui/button";
import { getBook } from "@/lib/data/books";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function BookDetailPage({ params }: PageProps) {
  const { id } = await params;
  const book = await getBook(id);

  if (!book) notFound();

  return (
    
      
        
          
          Back to catalog
        
      
      
    
  );
}
