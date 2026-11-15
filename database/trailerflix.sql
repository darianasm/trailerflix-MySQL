-- 1. Crear la base de datos y seleccionarla
DROP DATABASE IF EXISTS catalogo_peliculas;
CREATE DATABASE catalogo_peliculas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE catalogo_peliculas;

-- 2. Crear tablas principales
CREATE TABLE categoria (
    id_categoria INT AUTO_INCREMENT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    CONSTRAINT PK_categoria PRIMARY KEY (id_categoria),
    CONSTRAINT UQ_categoria_nombre UNIQUE (nombre)
) ENGINE=InnoDB;

CREATE TABLE actor (
    id_actor INT AUTO_INCREMENT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    CONSTRAINT PK_actor PRIMARY KEY (id_actor)
) ENGINE=InnoDB;

CREATE TABLE genero (
    id_genero INT AUTO_INCREMENT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    CONSTRAINT PK_genero PRIMARY KEY (id_genero),
    CONSTRAINT UQ_genero_nombre UNIQUE (nombre)
) ENGINE=InnoDB;

CREATE TABLE plataforma (
    id_plataforma INT AUTO_INCREMENT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    imagen VARCHAR(500) NULL,
    CONSTRAINT PK_plataforma PRIMARY KEY (id_plataforma),
    CONSTRAINT UQ_plataforma_nombre UNIQUE (nombre)
) ENGINE=InnoDB;

-- 3. Crear tabla de contenidos
CREATE TABLE contenido (
    id_contenido INT AUTO_INCREMENT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    sinopsis TEXT NOT NULL,
    temporadas INT NOT NULL,
    trailer VARCHAR(1000) NULL,
    id_categoria INT NOT NULL,
    CONSTRAINT PK_contenido PRIMARY KEY (id_contenido),
    CONSTRAINT FK_contenido_categoria FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria),
    CONSTRAINT CK_contenido_temporadas CHECK (temporadas >= 0)
) ENGINE=InnoDB;

-- 4. Tablas intermedias para relaciones muchos a muchos
CREATE TABLE contenido_actor (
    id_actor INT NOT NULL,
    id_contenido INT NOT NULL,
    CONSTRAINT PK_contenido_actor PRIMARY KEY (id_actor, id_contenido),
    CONSTRAINT FK_contenido_actor_actor FOREIGN KEY (id_actor) REFERENCES actor(id_actor) ON DELETE CASCADE,
    CONSTRAINT FK_contenido_actor_contenido FOREIGN KEY (id_contenido) REFERENCES contenido(id_contenido) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE contenido_genero (
    id_genero INT NOT NULL,
    id_contenido INT NOT NULL,
    CONSTRAINT PK_contenido_genero PRIMARY KEY (id_genero, id_contenido),
    CONSTRAINT FK_contenido_genero_genero FOREIGN KEY (id_genero) REFERENCES genero(id_genero) ON DELETE CASCADE,
    CONSTRAINT FK_contenido_genero_contenido FOREIGN KEY (id_contenido) REFERENCES contenido(id_contenido) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE contenido_plataforma (
    id_plataforma INT NOT NULL,
    id_contenido INT NOT NULL,
    CONSTRAINT PK_contenido_plataforma PRIMARY KEY (id_plataforma, id_contenido),
    CONSTRAINT FK_contenido_plataforma_plataforma FOREIGN KEY (id_plataforma) REFERENCES plataforma(id_plataforma) ON DELETE CASCADE,
    CONSTRAINT FK_contenido_plataforma_contenido FOREIGN KEY (id_contenido) REFERENCES contenido(id_contenido) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Cargar categorias
INSERT INTO categoria (nombre) VALUES ('Película'), ('Serie');

-- 6. Cargar generos
INSERT INTO genero (nombre) VALUES
('Drama'), ('Hechos verídicos'), ('Misterio'), ('Suspenso'), 
('Ciencia Ficción'), ('Aventura'), ('Acción'), ('Comedia'), 
('Fantasía'), ('Crimen'), ('Terror'), ('Animación'), ('Familia'), ('Romance');

-- 7. Cargar plataformas
INSERT INTO plataforma (nombre, imagen) VALUES
('Netflix', 'netflix.png'),
('Disney+', 'disney.png'),
('HBO Max', 'hbomax.png'),
('Amazon Prime', 'prime.png');

-- 8. Cargar actores
INSERT INTO actor (nombre) VALUES
('Claire Foy'), ('Olivia Colman'), ('Imelda Staunton'), ('Matt Smith'), ('Tobias Menzies'), ('Vanessa Kirby'),
('KJ Apa'), ('Lili Reinhart'), ('Camila Mendes'), ('Cole Sprouse'), ('Madelaine Petsch'),
('Pedro Pascal'), ('Gina Carano'), ('Giancarlo Esposito'), ('Carl Weathers'), ('Katee Sackhoff'),
('Elliot Page'), ('Tom Hopper'), ('David Castañeda'), ('Emmy Raver-Lampman'), ('Robert Sheehan'), ('Aidan Gallagher'),
('Anya Taylor-Joy'), ('Thomas Brodie-Sangster'), ('Harry Melling'), ('Moses Ingram'), ('Bill Camp'),
('Millie Bobby Brown'), ('Henry Cavill'), ('Sam Claflin'), ('Helena Bonham Carter'),
('Joaquin Phoenix'), ('Robert De Niro'), ('Zazie Beetz'), ('Frances Conroy'),
('Robert Downey Jr.'), ('Chris Evans'), ('Mark Ruffalo'), ('Chris Hemsworth'), ('Scarlett Johansson'), ('Jeremy Renner'),
('Florence Pugh'), ('David Harbour'), ('Rachel Weisz'), ('O-T Fagbenle'),
('Jessica Chastain'), ('John Malkovich'), ('Colin Farrell'), ('Common'), ('Geena Davis'),
('Ryan Phillippe'), ('Tim Robbins'), ('Rachael Leigh Cook'), ('Claire Forlani'),
('Ben Affleck'), ('Gal Gadot'), ('Jason Momoa'), ('Ezra Miller'), ('Ray Fisher'),
('Winona Ryder'), ('Finn Wolfhard'), ('Gaten Matarazzo'), ('Caleb McLaughlin'), ('Noah Schnapp'),
('Úrsula Corberó'), ('Álvaro Morte'), ('Itziar Ituño'), ('Pedro Alonso'), ('Miguel Herrán'),
('Ricardo Darín'), ('Carla Peterson'), ('César Troncoso'), ('Andrea Pietra'), ('Ariel Staltari'),
('Leonardo Sbaraglia'), ('Érica Rivas'), ('Darío Grandinetti'), ('Rita Cortese'), ('Oscar Martínez'),
('Soledad Villamil'), ('Guillermo Francella'), ('Pablo Rago'), ('Javier Godino'),
('Peter Lanzani'), ('Alejandra Flechner'), ('Norman Briski'),
('Bryan Cranston'), ('Aaron Paul'), ('Anna Gunn'), ('Dean Norris'), ('Bob Odenkirk'),
('Jenna Ortega'), ('Catherine Zeta-Jones'), ('Luis Guzmán'), ('Emma Myers'), ('Gwendoline Christie'),
('Gabriel Luna'), ('Anna Torv'), ('Nick Offerman'),
('Timothée Chalamet'), ('Rebecca Ferguson'), ('Oscar Isaac'), ('Josh Brolin'),
('Emily Blunt'), ('Matt Damon'),
('Anthony Gonzalez'), ('Gael García Bernal'), ('Benjamin Bratt'), ('Alanna Ubach'),
('Tom Hanks'), ('Tim Allen'), ('Don Rickles'), ('Jim Varney'),
('Jennifer Aniston'), ('Courteney Cox'), ('Lisa Kudrow'), ('Matt LeBlanc'), ('Matthew Perry'), ('David Schwimmer'),
('Steve Carell'), ('Rainn Wilson'), ('John Krasinski'), ('Jenna Fischer'), ('Ed Helms'),
('Matthew McConaughey'), ('Anne Hathaway'), ('Michael Caine'),
('Margot Robbie'), ('Ryan Gosling'), ('America Ferrera'), ('Kate McKinnon'),
('Louis Hofmann'), ('Lisa Vicari'), ('Oliver Masucci'), ('Jördis Triebel'), ('Maja Schöne');

-- 9. Cargar los 30 contenidos
INSERT INTO contenido (titulo, sinopsis, temporadas, trailer, id_categoria) VALUES
('The Crown', 'Recorre el reinado de Isabel II desde su juventud, mostrando cómo la vida privada de la familia real choca con las obligaciones de la Corona y los grandes acontecimientos políticos del siglo XX.', 6, 'https://www.youtube.com/results?search_query=The+Crown+trailer+oficial', 2),
('Riverdale', 'Detrás de la fachada tranquila de un pueblo pequeño, un grupo de estudiantes investiga un crimen que deja al descubierto los secretos más oscuros de sus familias y vecinos.', 7, 'https://www.youtube.com/results?search_query=Riverdale+trailer+oficial', 2),
('The Mandalorian', 'Tras la caída del Imperio, un cazarrecompensas solitario recorre los confines de la galaxia y termina protegiendo a una misteriosa criatura que muchos quieren capturar.', 3, 'https://www.youtube.com/results?search_query=The+Mandalorian+trailer+oficial', 2),
('The Umbrella Academy', 'Un grupo de hermanos adoptivos con poderes extraordinarios se reencuentra tras la muerte de su padre y descubre que tiene pocos días para evitar el fin del mundo.', 4, 'https://www.youtube.com/results?search_query=The+Umbrella+Academy+trailer+oficial', 2),
('Gambito de Dama', 'Una huérfana con un talento excepcional para el ajedrez se abre camino en un mundo dominado por hombres mientras lucha contra sus propias adicciones.', 1, NULL, 2),
('Enola Holmes', 'La hermana menor de Sherlock Holmes decide buscar por su cuenta a su madre desaparecida y, en el camino, se ve envuelta en una conspiración que involucra a un joven lord.', 0, 'https://www.youtube.com/results?search_query=Enola+Holmes+trailer+oficial', 1),
('Guasón', 'Un comediante fracasado y marginado por la sociedad de Ciudad Gótica atraviesa una espiral de violencia que lo transforma en uno de los criminales más temidos.', 0, 'https://www.youtube.com/results?search_query=Guason+Joker+trailer+oficial', 1),
('Avengers: Endgame', 'Después de perder a la mitad del universo, los Vengadores sobrevivientes se reúnen para un último intento de revertir el daño y enfrentar nuevamente a Thanos.', 0, 'https://www.youtube.com/results?search_query=Avengers+Endgame+trailer+oficial', 1),
('Black Widow', 'Natasha Romanoff se enfrenta a su pasado cuando una peligrosa conspiración la obliga a reencontrarse con la familia que dejó atrás antes de convertirse en Vengadora.', 0, 'https://www.youtube.com/results?search_query=Black+Widow+trailer+oficial', 1),
('AVA', 'Una asesina a sueldo que trabaja para una organización secreta se convierte en blanco de sus propios jefes después de cuestionar una misión que sale mal.', 0, 'https://www.youtube.com/results?search_query=AVA+2020+trailer+oficial', 1),
('AntiTrust', 'Un joven programador talentoso consigue el trabajo de sus sueños en una gran empresa de software, pero pronto sospecha que su jefe esconde algo muy peligroso.', 0, NULL, 1),
('La Liga de la Justicia de Zack Snyder', 'Batman y la Mujer Maravilla reúnen a un equipo de héroes con habilidades únicas para defender la Tierra de una amenaza de proporciones catastróficas.', 0, 'https://www.youtube.com/results?search_query=Liga+de+la+Justicia+de+Zack+Snyder+trailer+oficial', 1),
('Stranger Things', 'En un pequeño pueblo de los años ochenta, la desaparición de un niño lleva a sus amigos a descubrir experimentos secretos, fuerzas sobrenaturales y a una misteriosa niña.', 5, 'https://www.youtube.com/results?search_query=Stranger+Things+trailer+oficial', 2),
('La Casa de Papel', 'Un enigmático profesor reúne a un grupo de delincuentes con alias de ciudades para ejecutar un atraco sin precedentes en la Fábrica Nacional de Moneda y Timbre de España.', 5, 'https://www.youtube.com/results?search_query=La+Casa+de+Papel+trailer+oficial', 2),
('El Eternauta', 'Una nevada tóxica cae sobre Buenos Aires y mata a casi toda la población. Un grupo de sobrevivientes debe organizarse para resistir a una invasión que recién comienza.', 1, 'https://www.youtube.com/results?search_query=El+Eternauta+serie+trailer+oficial', 2),
('Relatos Salvajes', 'Seis historias independientes muestran a personas comunes que, frente a una situación injusta o absurda, pierden el control y reaccionan de las formas más extremas.', 0, NULL, 1),
('El Secreto de sus Ojos', 'Un empleado judicial retirado decide escribir una novela sobre un crimen que investigó décadas atrás, y al hacerlo reabre heridas del caso y de un amor nunca confesado.', 0, 'https://www.youtube.com/results?search_query=El+Secreto+de+sus+Ojos+trailer+oficial', 1),
('Argentina, 1985', 'Un fiscal y su joven equipo se enfrentan a amenazas y presiones mientras preparan el histórico juicio a los responsables de la última dictadura militar argentina.', 0, NULL, 1),
('Breaking Bad', 'Un profesor de química con una enfermedad terminal se asocia con un exalumno para fabricar metanfetamina y asegurar el futuro económico de su familia.', 5, 'https://www.youtube.com/results?search_query=Breaking+Bad+trailer+oficial', 2),
('Merlina', 'Merlina Addams llega a una academia para jóvenes con habilidades especiales, donde intenta dominar sus poderes y resolver una serie de asesinatos que aterrorizan al pueblo.', 2, 'https://www.youtube.com/results?search_query=Merlina+Wednesday+trailer+oficial', 2),
('The Last of Us', 'Veinte años después de una pandemia que devastó a la humanidad, un contrabandista endurecido debe escoltar a una adolescente a través de un país en ruinas.', 2, 'https://www.youtube.com/results?search_query=The+Last+of+Us+serie+trailer+oficial', 2),
('Duna', 'El heredero de una familia noble viaja al planeta desértico más peligroso del universo, fuente del recurso más valioso de la galaxia, donde queda atrapado en una lucha por el poder.', 0, 'https://www.youtube.com/results?search_query=Duna+2021+trailer+oficial', 1),
('Oppenheimer', 'Retrata la vida del físico que dirigió el desarrollo de la primera bomba atómica y los dilemas morales y políticos que lo persiguieron después.', 0, 'https://www.youtube.com/results?search_query=Oppenheimer+trailer+oficial', 1),
('Coco', 'Un niño mexicano que sueña con ser músico viaja accidentalmente a la Tierra de los Muertos, donde busca a su tatarabuelo para descubrir la verdad sobre su familia.', 0, NULL, 1),
('Toy Story', 'Los juguetes de un niño cobran vida cuando nadie los ve, y la llegada de un moderno guardián espacial pone en jaque el liderazgo de un vaquero de trapo.', 0, NULL, 1),
('Friends', 'Seis amigos que viven en Nueva York comparten trabajos, romances, mudanzas y tardes interminables en su cafetería favorita.', 10, 'https://www.youtube.com/results?search_query=Friends+serie+trailer', 2),
('The Office', 'Un falso documental sigue el día a día de los empleados de una distribuidora de papel y de su jefe, tan bienintencionado como incómodo.', 9, NULL, 2),
('Interestelar', 'Con la Tierra al borde del colapso, un expiloto se une a una misión que atraviesa un agujero de gusano en busca de un nuevo hogar para la humanidad.', 0, 'https://www.youtube.com/results?search_query=Interestelar+trailer+oficial', 1),
('Barbie', 'Tras una crisis existencial, Barbie abandona su mundo perfecto y viaja junto a Ken al mundo real, donde descubre que las cosas no son como imaginaba.', 0, 'https://www.youtube.com/results?search_query=Barbie+2023+trailer+oficial', 1),
('Dark', 'La desaparición de dos niños en un pueblo alemán revela los vínculos ocultos entre cuatro familias y un misterio que se extiende a lo largo de varias generaciones.', 3, NULL, 2);