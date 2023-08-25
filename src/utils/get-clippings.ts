import { readFileSync } from "fs";
import { toObject } from "kindle-zhcn-clippings-to-json";
import { headers } from "next/headers";
import path from "path";

export type HighlightType = ReturnType<typeof toObject>[number] & {
  id: number;
  notes: ReturnType<typeof toObject>[number][];
};

type BookType = {
  title: string;
  author?: string;
  highlights: HighlightType[];
  id: number;
};

export async function getClippings() {
  const host = headers().get("host");
  const protocal = process?.env.NODE_ENV === "development" ? "http" : "https";

  const __next__base__dirname = __dirname.split(".next")[0];

  // const myClippings = await fetch(`${protocal}://${host}/My Clippings.txt`, {
  //   method: "GET",
  //   next: {
  //     revalidate: false,
  //   },
  // }).then((response) => {
  //   return response.text();
  // });

  const myClippings = await readFileSync(
    path.join(__next__base__dirname, "/public/My Clippings.txt"),
    {
      encoding: "utf-8",
    }
  );

  // console.log('myClippings2',myClippings2)

  const clippings = toObject(myClippings);
  const books: {
    [key: string]: BookType;
  } = {};
  const notes: any[] = [];
  let id = 0;
  let highlightId = 0;

  clippings.map((clipping) => {
    if (clipping.title) {
      if (!books[clipping.title]) {
        const book = {
          title: clipping.title,
          author: clipping.author,
          highlights: [],
          id: id++,
        };
        books[clipping.title] = book;
      }
      if (clipping.type === "Note") {
        notes.push(clipping);
      } else {
        books[clipping.title].highlights.push({
          ...clipping,
          id: highlightId++,
          notes: [],
        });
      }
    }
  });

  notes.map((note) => {
    const currentHighlight = books[note.title].highlights.find(
      (highlight) =>
        highlight.start &&
        highlight.end &&
        highlight.start <= note.start &&
        highlight.end >= note.start
    );
    currentHighlight?.notes.push(note);
  });

  return Object.values(books);
}
