import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, Compass, MapPin, Search, ChevronRight, Loader2 } from "lucide-react";
import { Shell } from "@/components/app-ui";
import { actions, useStore } from "@/lib/store";
import { toast } from "sonner";
import type {
  Map as LeafletMap,
  Marker as LeafletMarker,
  Circle as LeafletCircle,
  LeafletMouseEvent,
} from "leaflet";
import "leaflet/dist/leaflet.css";

export const Route = createFileRoute("/location")({
  head: () => ({
    meta: [
      { title: "Select UK Location | Zifily" },
      {
        name: "description",
        content: "Choose your UK city, town, or postcode to find local verified specialists.",
      },
    ],
  }),
  component: LocationPage,
});

export type UkPlace = {
  name: string;
  area: string;
  lat: number;
  lng: number;
};

// Comprehensive UK Cities, Regions & London Boroughs
const ukPopularPlaces: UkPlace[] = [
  // London Boroughs & Central
  { name: "Central London", area: "Westminster, Soho, Mayfair & City", lat: 51.5074, lng: -0.1278 },
  { name: "Shoreditch & Hackney", area: "East London, UK", lat: 51.5285, lng: -0.0784 },
  {
    name: "Canary Wharf & Isle of Dogs",
    area: "London E14, Docklands, UK",
    lat: 51.5054,
    lng: -0.0235,
  },
  { name: "Kensington, Chelsea & Fulham", area: "West London, UK", lat: 51.4988, lng: -0.1749 },
  { name: "Camden Town & Islington", area: "North London, UK", lat: 51.539, lng: -0.1426 },
  {
    name: "Clapham, Battersea & Wandsworth",
    area: "South West London, UK",
    lat: 51.4624,
    lng: -0.1382,
  },
  { name: "Greenwich & Blackheath", area: "South East London, UK", lat: 51.4826, lng: 0.0077 },
  {
    name: "Richmond & Kingston upon Thames",
    area: "South West London, UK",
    lat: 51.4613,
    lng: -0.3037,
  },
  { name: "Croydon & Bromley", area: "Greater London, UK", lat: 51.3762, lng: -0.0982 },
  { name: "Wembley & Harrow", area: "North West London, UK", lat: 51.556, lng: -0.2796 },
  { name: "Stratford & Newham", area: "East London, UK", lat: 51.5416, lng: 0.0033 },

  // Greater Manchester & North West
  { name: "Manchester City Centre", area: "Greater Manchester, UK", lat: 53.4808, lng: -2.2426 },
  { name: "Salford & MediaCityUK", area: "Greater Manchester, UK", lat: 53.4839, lng: -2.2744 },
  { name: "Liverpool & Albert Dock", area: "Merseyside, UK", lat: 53.4084, lng: -2.9916 },

  // West Midlands
  { name: "Birmingham Core", area: "West Midlands, UK", lat: 52.4862, lng: -1.8904 },
  { name: "Coventry & Warwickshire", area: "West Midlands, UK", lat: 52.4068, lng: -1.5197 },

  // Yorkshire & Humber
  { name: "Leeds City Centre", area: "West Yorkshire, UK", lat: 53.8008, lng: -1.5491 },
  { name: "Sheffield & Peak District", area: "South Yorkshire, UK", lat: 53.3811, lng: -1.4701 },
  { name: "York Historic Centre", area: "North Yorkshire, UK", lat: 53.9599, lng: -1.0873 },

  // Scotland
  { name: "Edinburgh Central & Leith", area: "Scotland, UK", lat: 55.9533, lng: -3.1883 },
  { name: "Glasgow City & West End", area: "Scotland, UK", lat: 55.8642, lng: -4.2518 },
  { name: "Aberdeen & Grampian", area: "Scotland, UK", lat: 57.1497, lng: -2.0943 },

  // South West
  { name: "Bristol Harbourside & Clifton", area: "South West, UK", lat: 51.4545, lng: -2.5879 },
  { name: "Bath & Somerset", area: "South West, UK", lat: 51.3758, lng: -2.3599 },
  { name: "Exeter & Devon", area: "South West, UK", lat: 50.7184, lng: -3.5339 },

  // South & South East
  { name: "Brighton & Hove", area: "East Sussex, UK", lat: 50.8225, lng: -0.1372 },
  { name: "Oxford City", area: "Oxfordshire, UK", lat: 51.752, lng: -1.2577 },
  { name: "Cambridge Central", area: "Cambridgeshire, UK", lat: 52.2053, lng: 0.1218 },
  { name: "Reading & Berkshire", area: "Thames Valley, UK", lat: 51.4543, lng: -0.9781 },
  { name: "Southampton & Portsmouth", area: "Hampshire, UK", lat: 50.9097, lng: -1.4044 },

  // Wales & Northern Ireland
  { name: "Cardiff & Cardiff Bay", area: "Wales, UK", lat: 51.4816, lng: -3.1791 },
  { name: "Belfast City Centre", area: "Northern Ireland, UK", lat: 54.5973, lng: -5.9301 },

  // East Midlands & North East
  { name: "Nottingham & Derby", area: "East Midlands, UK", lat: 52.9548, lng: -1.1581 },
  {
    name: "Newcastle upon Tyne & Gateshead",
    area: "Tyne and Wear, UK",
    lat: 54.9783,
    lng: -1.6178,
  },
  { name: "Leicester City", area: "Leicestershire, UK", lat: 52.6369, lng: -1.1398 },
  { name: "Milton Keynes", area: "Buckinghamshire, UK", lat: 52.0406, lng: -0.7594 },
];

function LocationPage() {
  const router = useRouter();
  const currentLoc = useStore((s) => s.location);

  // View state: 'search' | 'map'
  const [viewMode, setViewMode] = useState<"search" | "map">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedName, setSelectedName] = useState(currentLoc.address);
  const [coords, setCoords] = useState({ lat: currentLoc.lat, lng: currentLoc.lng });
  const [radiusKm, setRadiusKm] = useState(currentLoc.radiusKm || 15);

  // Dynamic UK Geocoding (Nominatim OpenStreetMap)
  const [geoResults, setGeoResults] = useState<UkPlace[]>([]);
  const [isSearchingUk, setIsSearchingUk] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const circleRef = useRef<LeafletCircle | null>(null);

  // Live UK geocode search when typing postcodes or custom UK places
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setGeoResults([]);
      setIsSearchingUk(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingUk(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery.trim(),
        )}&countrycodes=gb&addressdetails=1&limit=6`;
        const res = await fetch(url, { headers: { "Accept-Language": "en-GB,en" } });
        if (res.ok) {
          const data = (await res.json()) as Array<{
            name?: string;
            display_name: string;
            lat: string;
            lon: string;
          }>;
          const mapped: UkPlace[] = data.map((item) => {
            const parts = item.display_name.split(",");
            const title = item.name || parts[0]?.trim() || searchQuery;
            const subtitle = parts.slice(1, 4).join(",").trim() || "United Kingdom";
            return {
              name: title,
              area: subtitle,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
            };
          });
          setGeoResults(mapped);
        }
      } catch {
        // Fallback to static list silently
      } finally {
        setIsSearchingUk(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Static UK matching places
  const staticMatches = ukPopularPlaces.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.area.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Combined places without duplicates
  const displayedPlaces =
    searchQuery.trim().length >= 2 && geoResults.length > 0 ? geoResults : staticMatches;

  // Initialize and update Leaflet when entering 'map' view with fast single init
  useEffect(() => {
    if (viewMode !== "map") return;
    let isMounted = true;

    async function initOrUpdateLeaflet() {
      const L = await import("leaflet");
      if (!isMounted || !mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        // Initialize Map once with high performance settings
        const map = L.map(mapContainerRef.current, {
          center: [coords.lat, coords.lng],
          zoom: 12,
          zoomControl: true,
          preferCanvas: true,
        });

        // Fast parallel tile loading with subdomains & pre-buffering
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          subdomains: ["a", "b", "c"],
          attribution: "&copy; OpenStreetMap UK",
          maxZoom: 19,
          keepBuffer: 6,
          updateWhenIdle: false,
          updateWhenZooming: false,
        }).addTo(map);

        const blackIcon = L.divIcon({
          className: "custom-leaflet-marker",
          html: `
            <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
              <div style="width: 26px; height: 26px; background: #000; border-radius: 9999px; border: 3px solid #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;">
                <div style="width: 8px; height: 8px; background: #fff; border-radius: 9999px;"></div>
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([coords.lat, coords.lng], {
          draggable: true,
          icon: blackIcon,
        }).addTo(map);

        const circle = L.circle([coords.lat, coords.lng], {
          radius: radiusKm * 1000,
          color: "#000000",
          fillColor: "#000000",
          fillOpacity: 0.08,
          weight: 1.5,
          dashArray: "4, 6",
        }).addTo(map);

        marker.on("dragend", () => {
          const newPos = marker.getLatLng();
          setCoords({ lat: newPos.lat, lng: newPos.lng });
          circle.setLatLng(newPos);
          setSelectedName(
            `Pinned UK Location (${newPos.lat.toFixed(3)}, ${newPos.lng.toFixed(3)})`,
          );
        });

        map.on("click", (e: LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          setCoords({ lat, lng });
          marker.setLatLng([lat, lng]);
          circle.setLatLng([lat, lng]);
          setSelectedName(`Selected UK Pin (${lat.toFixed(3)}, ${lng.toFixed(3)})`);
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;
        circleRef.current = circle;

        requestAnimationFrame(() => {
          map.invalidateSize();
        });
      } else {
        // Fast instant update without recreating map
        markerRef.current?.setLatLng([coords.lat, coords.lng]);
        circleRef.current?.setLatLng([coords.lat, coords.lng]);
        circleRef.current?.setRadius(radiusKm * 1000);
        mapInstanceRef.current.panTo([coords.lat, coords.lng], { animate: true, duration: 0.25 });
      }
    }

    initOrUpdateLeaflet();

    return () => {
      isMounted = false;
    };
  }, [viewMode, coords.lat, coords.lng, radiusKm]);

  // Clean up Leaflet on page unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleSelectPlace = (place: UkPlace) => {
    setSelectedName(place.name);
    setCoords({ lat: place.lat, lng: place.lng });
    setViewMode("map");
  };

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        setSelectedName("Current UK Location (GPS)");
        setViewMode("map");
        toast.success("Retrieved current GPS coordinates");
      },
      () => toast.error("Could not retrieve GPS location"),
    );
  };

  const handleConfirmLocation = () => {
    actions.setLocation({
      address: selectedName,
      lat: coords.lat,
      lng: coords.lng,
      radiusKm,
    });
    toast.success(`Location set to ${selectedName}`);
    router.history.back();
  };

  // STEP 1: Search View (Shows UK names & postcodes while typing)
  if (viewMode === "search") {
    return (
      <Shell hideNav fullWidth>
        <div className="mx-auto flex h-screen max-h-screen max-w-xl flex-col px-4 py-3 sm:py-6 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-black/10 dark:border-white/10 pb-3 shrink-0">
            <button
              onClick={() => router.history.back()}
              aria-label="Back"
              className="grid h-9 w-9 place-items-center rounded-xl border border-black/10 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5 active:scale-95 transition"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-base font-bold truncate">Select UK Location</h1>
              <p className="text-[11px] text-muted-foreground truncate">
                Search UK cities, towns, London boroughs or postcodes
              </p>
            </div>
          </div>

          {/* Search Input with UK Geocoder */}
          <div className="mt-3 shrink-0">
            <label className="flex h-11 items-center gap-3 rounded-2xl border border-black/15 bg-muted/30 px-3.5 transition focus-within:border-black focus-within:bg-background dark:border-white/15 dark:focus-within:border-white">
              {isSearchingUk ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <Search className="h-4 w-4 text-muted-foreground" />
              )}
              <input
                autoFocus
                type="text"
                placeholder="e.g. Manchester, SW1A 1AA, Shoreditch, Leeds..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold outline-none placeholder:text-muted-foreground"
              />
            </label>
          </div>

          {/* Quick Actions: GPS & Open Map Pin */}
          <div className="mt-2.5 flex gap-2 shrink-0">
            <button
              onClick={handleUseGps}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-black/10 bg-background py-2 text-xs font-semibold hover:border-black active:scale-95 dark:border-white/10 dark:hover:border-white transition"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Use My GPS</span>
            </button>
            <button
              onClick={() => setViewMode("map")}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-black py-2 text-xs font-semibold text-white transition hover:bg-black/90 active:scale-95 dark:bg-white dark:text-black dark:hover:bg-white/90"
            >
              <MapPin className="h-3.5 w-3.5" />
              <span>Pin on UK Map</span>
            </button>
          </div>

          {/* Suggested UK Locations List */}
          <div className="mt-4 flex flex-1 flex-col min-h-0 overflow-hidden">
            <div className="flex items-center justify-between px-1 pb-1.5 shrink-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {searchQuery
                  ? `Matching UK Locations (${displayedPlaces.length})`
                  : "Major UK Cities & London Boroughs"}
              </p>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                United Kingdom
              </span>
            </div>

            <div className="flex-1 divide-y divide-black/5 rounded-2xl border border-black/10 bg-card dark:divide-white/5 dark:border-white/10 overflow-y-auto no-scrollbar">
              {displayedPlaces.map((place, idx) => (
                <button
                  key={`${place.name}-${idx}`}
                  onClick={() => handleSelectPlace(place)}
                  className="flex w-full items-center justify-between p-3 text-left transition hover:bg-muted/40"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-muted text-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                    </span>
                    <div className="truncate">
                      <p className="text-xs font-bold truncate">{place.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{place.area}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                </button>
              ))}

              {displayedPlaces.length === 0 && !isSearchingUk && (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  <p>No UK place found for "{searchQuery}".</p>
                  <button
                    onClick={() => {
                      setSelectedName(searchQuery);
                      setViewMode("map");
                    }}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-black px-4 py-2 font-semibold text-white dark:bg-white dark:text-black"
                  >
                    <span>Pin "{searchQuery}" on UK Map</span>
                    <ArrowLeft className="h-3 w-3 rotate-180" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  // STEP 2: Minimalist Leaflet Map Page to Pin Location in UK
  return (
    <Shell hideNav fullWidth>
      <div className="flex h-screen max-h-screen w-full flex-col bg-background overflow-hidden">
        {/* Minimal Map Top Bar */}
        <div className="flex items-center justify-between border-b bg-background px-3 py-2.5 sm:px-4 sm:py-3 shadow-xs shrink-0 z-20">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => setViewMode("search")}
              aria-label="Back to search"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-black/10 hover:bg-muted dark:border-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <p className="text-xs font-bold leading-tight truncate max-w-[170px] sm:max-w-md">
                {selectedName}
              </p>
              <p className="text-[10px] text-muted-foreground hidden sm:block">
                Drag the black pin or click map anywhere across the UK
              </p>
            </div>
          </div>

          <button
            onClick={handleConfirmLocation}
            aria-label="Confirm location"
            className="flex items-center gap-1.5 rounded-xl bg-black px-3 py-2 sm:px-4 sm:py-2 text-xs font-bold text-white transition hover:bg-black/90 active:scale-95 dark:bg-white dark:text-black shrink-0"
          >
            <Check className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Confirm UK Area</span>
          </button>
        </div>

        {/* Minimal Leaflet Map Canvas */}
        <div className="relative flex-1">
          <div
            ref={mapContainerRef}
            className="h-full w-full"
            style={{
              filter: "grayscale(100%) contrast(110%)",
            }}
          />

          {/* Minimal Floating Radius Bar */}
          <div className="absolute bottom-6 inset-x-4 z-[1000] mx-auto max-w-sm rounded-2xl border border-black/20 bg-background/95 p-3.5 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between text-xs font-bold">
              <span>Service Radius (UK)</span>
              <span>{radiusKm} km</span>
            </div>

            <div className="mt-2 flex gap-2">
              {[5, 15, 25, 50].map((r) => (
                <button
                  key={r}
                  onClick={() => setRadiusKm(r)}
                  className={`flex-1 rounded-lg border py-1 text-xs font-semibold transition ${
                    radiusKm === r
                      ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                      : "border-black/10 hover:border-black/30"
                  }`}
                >
                  {r}km
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
