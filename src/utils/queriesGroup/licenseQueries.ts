import { useQuery } from "@tanstack/react-query";
import type { ProjectOption } from "../../stores/interfaces/License";

/** ---------- Mock fetcher ----------
 * ภายหลังเปลี่ยนเป็น axios.get("/project/list") ได้ทันที
 * แล้ว return data.map(...) ให้อยู่ในรูป ProjectOption[]
 */
const getProjectOptions = async (): Promise<ProjectOption[]> => {
  // mock delay เล็กน้อยให้เหมือนเรียก API
  await new Promise((r) => setTimeout(r, 300));
  return [
    { id: "p1", name: "AiTAN" },
    { id: "p2", name: "LumiTech Villa" },
    { id: "p3", name: "TerraLink Housing" },
    { id: "p4", name: "HomeSync One" },
    { id: "p5", name: "Nexa Urban" },
  ];
};

export const useProjectOptionsQuery = () =>
  useQuery<ProjectOption[], Error>({
    queryKey: ["projectOptions"],
    queryFn: getProjectOptions,
    staleTime: 5 * 60 * 1000,
  });
