
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  Timestamp,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import type { Project, SearchResultItem } from '@/types/archive';

const PROJECTS_COLLECTION = 'projects';
const SAVED_ITEMS_SUBCOLLECTION = 'savedItems';

// Helper to convert Firestore Timestamps to ISO strings
const convertTimestamps = (data: any) => {
  const newData = { ...data };
  for (const key in newData) {
    if (newData[key] instanceof Timestamp) {
      newData[key] = newData[key].toDate().toISOString();
    }
  }
  return newData;
};


export async function getProjects(): Promise<Project[]> {
  try {
    const projectsQuery = query(collection(db, PROJECTS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(projectsQuery);
    return snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }) as Project);
  } catch (error) {
    console.error("Error fetching projects: ", error);
    throw new Error("Failed to fetch projects.");
  }
}

export async function createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'lastModified'>): Promise<Project> {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), {
      ...projectData,
      createdAt: now,
      lastModified: now,
    });
    return convertTimestamps({ id: docRef.id, ...projectData, createdAt: now, lastModified: now }) as Project;
  } catch (error) {
    console.error("Error creating project: ", error);
    throw new Error("Failed to create project.");
  }
}

export async function getProjectDetails(projectId: string): Promise<Project | null> {
  try {
    const docRef = doc(db, PROJECTS_COLLECTION, projectId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return convertTimestamps({ id: docSnap.id, ...docSnap.data() }) as Project;
    }
    return null;
  } catch (error) {
    console.error("Error fetching project details: ", error);
    throw new Error("Failed to fetch project details.");
  }
}

export async function saveItemToProject(projectId: string, itemData: SearchResultItem): Promise<void> {
  try {
    const itemDocRef = doc(db, PROJECTS_COLLECTION, projectId, SAVED_ITEMS_SUBCOLLECTION, itemData.id);
    const { id, title, descriptionSnippet, thumbnailUrl, videoUrl, metadata, annotations, tags } = itemData;
    
    const dataToSave = {
      id,
      title,
      descriptionSnippet: descriptionSnippet || metadata.description.substring(0,150) || "No snippet",
      thumbnailUrl: thumbnailUrl || `https://archive.org/services/img/${id}`,
      videoUrl: videoUrl || `https://archive.org/details/${id}`,
      metadata: { // Store a subset or all of metadata as needed
        identifier: metadata.identifier,
        title: metadata.title,
        description: metadata.description,
        subjects: metadata.subjects || [],
        datePublished: metadata.datePublished || '',
        creator: metadata.creator || '',
        collection: metadata.collection || [],
      },
      annotations: annotations || '',
      tags: tags || [],
      savedAt: Timestamp.now(),
    };

    await setDoc(itemDocRef, dataToSave, { merge: true }); // Use merge to update if exists or create if not

    // Update project's lastModified timestamp
    const projectDocRef = doc(db, PROJECTS_COLLECTION, projectId);
    await setDoc(projectDocRef, { lastModified: Timestamp.now() }, { merge: true });

  } catch (error) {
    console.error("Error saving item to project: ", error);
    throw new Error("Failed to save item to project.");
  }
}

export async function removeItemFromProject(projectId: string, itemId: string): Promise<void> {
  try {
    const itemDocRef = doc(db, PROJECTS_COLLECTION, projectId, SAVED_ITEMS_SUBCOLLECTION, itemId);
    await deleteDoc(itemDocRef);

    // Update project's lastModified timestamp
    const projectDocRef = doc(db, PROJECTS_COLLECTION, projectId);
    await setDoc(projectDocRef, { lastModified: Timestamp.now() }, { merge: true });
  } catch (error) {
    console.error("Error removing item from project: ", error);
    throw new Error("Failed to remove item from project.");
  }
}

export async function getSavedItemsForProject(projectId: string): Promise<Map<string, Pick<SearchResultItem, 'annotations' | 'tags'>>> {
  const savedItemsMap = new Map<string, Pick<SearchResultItem, 'annotations' | 'tags'>>();
  try {
    const itemsQuery = query(collection(db, PROJECTS_COLLECTION, projectId, SAVED_ITEMS_SUBCOLLECTION));
    const snapshot = await getDocs(itemsQuery);
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      savedItemsMap.set(doc.id, {
        annotations: data.annotations || '',
        tags: data.tags || [],
      });
    });
  } catch (error) {
    console.error("Error fetching saved items for project: ", error);
    // Continue with an empty map in case of error, so the app doesn't break
  }
  return savedItemsMap;
}
